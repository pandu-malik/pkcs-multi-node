# Public Key Encryption and Digital Signature
### Muhammad Malik Pandu Galang - 203022420030
## ENCRYPT
`curl -X POST -H "Content-Type: application/json" -d '{"data": "This is a secret message."}' http://localhost:3000/encrypt`

## DECRYPT
`curl -X POST -H "Content-Type: application/json" -d '{"encryptedData":"<output from encrypt result>"}' http://localhost:3000/decrypt`

## SIGN
1. Run the client first, to out the Signature

`curl -X POST -H "Content-Type: application/json" -d '{"data": "This is the data to sign.", "signature": "<output from running client>"}' http://localhost:3000/verify-signature`

## SIGN DOC
`curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "document=@/Users/pandumalik/Documents/Personal/Kuliah/PDK/pkcs-multi-node/sample.txt" \
  -F "description=This is a confidential report." \
  http://localhost:3000/sign-doc`

## VERIF DOC
`curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "document=@/Users/pandumalik/Documents/Personal/Kuliah/PDK/pkcs-multi-node/sample.txt" \
  -F "signature=<output from sign>" \
  http://localhost:3000/verify-doc`
  
================================
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "document=@/Users/pandumalik/Documents/Personal/Kuliah/PDK/pkcs-multi-node/sample.txt" \
  -F "signature=Omp9aLdf3VJBTrlcTAg5JgqAm6tqEoa+8zWWETRZFRvTjjNq5dT+etm1tE7hP8HZkV8wO9tBLgiwK5pk2QN2YG3uihG833M7bFqK6sFluMTtIoYi5bmJ4f7NmU+v+CbWevQ2owQ+g5fQd49qz/xO+g8pn0QDcAW9nCwUsusttuOQtXyuteOiPHs/DiZ0z0HImGEQsVs5kAOVeVBuNoaNoXjGFkEK2QvPklR23D+PyzEB+S476oQJJ12DOmSEKaevesZxeBzjTNg5WUoyv1GrW2AHJ2k+Z2RaofDxAtbhnMuQgeD3gFr3Qco2+TslYjuX8QyUXRwwIdCMT14/Tcau8A==" \
  http://localhost:3000/verify-doc
