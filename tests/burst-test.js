import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 50,
  iterations: 50,
};

export default function () {
  // Check this line! You probably have 'goo.get' or just 'goo'
  http.get('http://localhost:8080'); 
}