import subprocess
import time
import os
import json

algorithms = [
    "fixed-window.js", 
    "sliding-log.js", 
    "token-bucket.js", 
    "leaky-bucket.js"
]

results = []

def run_test(algo_file):
    print(f"\n🚀 Starting Experiment: {algo_file}")
    
    # 1. Reset Environment
    subprocess.run(["docker", "compose", "down"], capture_output=True)
    
    # 2. Spin up cluster with specific algo
    env = os.environ.copy()
    env["ALGO_FILE"] = algo_file
    subprocess.run(["docker", "compose", "up", "--build", "-d"], env=env)
    
    time.sleep(5) # Warm up
    
    # 3. Run k6 and capture output for debugging
    print(f"   📊 Stress testing...")
    process = subprocess.run([
        "k6", "run", 
        "--summary-export=temp_result.json", 
        "tests/burst-test.js"
    ], capture_output=True, text=True)

    # Check if k6 actually worked
    if process.returncode != 0:
        print(f"❌ k6 failed! Error: {process.stderr}")
        return # Skip to the next algorithm

    # Check if the file exists and is not empty
    if not os.path.exists("temp_result.json") or os.path.getsize("temp_result.json") == 0:
        print("❌ temp_result.json was not created or is empty.")
        return
    
    # 4. Parse the JSON result
    with open("temp_result.json") as f:
        data = json.load(f)
        metrics = data['metrics']
        
        # Extract key comparison stats
        success_rate = (1 - metrics['http_req_failed']['values']['rate']) * 100
        avg_latency = metrics['http_req_duration']['values']['avg']
        total_reqs = metrics['http_reqs']['values']['count']
        
        results.append({
            "Algorithm": algo_file,
            "Success Rate": f"{success_rate:.1f}%",
            "Avg Latency": f"{avg_latency:.2f}ms",
            "Total Reqs": total_reqs
        })

# Run the loop
for algo in algorithms:
    run_test(algo)

# --- THE COMPARISON SUMMARY ---
print("\n" + "="*50)
print("FINAL ALGORITHM COMPARISON")
print("="*50)
print(f"{'Algorithm':<20} | {'Success':<10} | {'Latency':<10}")
print("-" * 50)
for r in results:
    print(f"{r['Algorithm']:<20} | {r['Success Rate']:<10} | {r['Avg Latency']:<10}")
print("="*50)

# Cleanup
if os.path.exists("temp_result.json"):
    os.remove("temp_result.json")