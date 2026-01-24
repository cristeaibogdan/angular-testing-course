Run this line to generate coverage:
$env:CHROME_BIN="C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
ng test --watch=false --code-coverage

npm install -g http-server (ONLY ONCE)

cd coverage/

http-server -c-1