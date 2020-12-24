Tested with node: `14.15.2`
# Getting started
```bash
docker compose-up


curl --location --request POST 'http://localhost:80/word/' \
--header 'Content-Type: text/plain' \
--data-raw 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

curl --location --request POST 'http://localhost:80/word/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "filePath": "simpleText.txt"
}'

curl --location --request POST 'http://localhost:80/word/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "url": "https://gist.githubusercontent.com/phillipj/4944029/raw/75ba2243dd5ec2875f629bf5d79f6c1e4b5a8b46/alice_in_wonderland.txt"
}'

curl --location --request GET 'http://localhost:80/word/counter?term=alice'
```

# Test
```bash
docker-compose up mongo
npm t
```

# Create test file
For creating huge in file system:
```bash
node createTestFile.js
```

# Assumptions
1. Alice === alice
2. Special characters inside word: `sas!?ha` breaking word to 2 without lexical check: `sas ha`
3. Only englist support for sanitization
4. Eventually consistence results