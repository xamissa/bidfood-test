import requests
import json

url = "https://pos.bidfood.co.za/api/Product/authentication"

payload = json.dumps({
  "userName": "alan",
  "password": "test"
})
headers = {
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)
print(response.text)


url = "https://pos.bidfood.co.za/api/Product"

payload={}
headers = {
  'Content-Type': 'application/json',
  'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFsYW4iLCJuYmYiOjE2NDYzMzI4NjYsImV4cCI6MTY0NjMzNjQ2NiwiaWF0IjoxNjQ2MzMyODY2fQ.vXX1tt_jbD3J7gqgD2_5qd2otlxZq5KEMABR39CLEgg'
  
}

response = requests.request("GET", url, headers=headers, data=payload)

print("===============",response.status_code,response.text)

