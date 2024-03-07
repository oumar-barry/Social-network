## Usage
Créer un fichier config.env dans le dossier config et remplacer les valeurs entre <   >

PORT = 8000
DB_STRING = <YOUR_MONDODB_CONNECTION_STRING>
JWT_EXPIRE = 30d
JWT_SECRET = <YOUR_JWT_SECRET_KEY>
MAX_PROFILE_PICTURE_SIZE = 10000000

## Installation 
npm install 

## Execution
npm run dev 

## Database seeding
node seeder -f 
