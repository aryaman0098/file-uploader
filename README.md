## File Uploader

This is a full-stack web application that allows users to store, preview, download, and delete files securely on the cloud. Users can authenticate themselves using google authentication. Once authenticated, users can upload their files using this app, which are stored in Firebase. Using the app, users can preview, download or delete their files.

### Tech stack

The following tech has been used to develop this app

- [React.js](https://react.dev) (Frontend)
- [Nest.js](https://nestjs.com) (Backend)
- [PostgreSQL](https://www.postgresql.org) (Database)
- [Firebase](https://firebase.google.com) 
  - Authentication
  - Cloud Storage
- [Docker](https://www.docker.com/) (Containerization)

### Local Setup

To run the app locally, we will need to fulfill some prerequisites

1. Create a firebase project.
2. Enable Google authentication in Firebase authentication.
3. Enable Firebase storage (you can choose the Firebase `Blaze` plan. It is free for storing and retreiving files of small size)
4. `Docker` should be installed locally.


Clone the repository to your local system. The repo consists both folders for frontend and backend applications. 

We will need firebase config key file. It is used by backend for performing authenticated actions. This file can be obtained by openning your firebase project. Then go to:

`Settings > Project settings > Service accounts > Generate new private key`

Keep this file in the root level of the project.

Run the command:
```
docker compose build
```
to install all the dependencies.

##### Setting up CORS

Since the app interacts with Firebase Storage (which is built on top of Google Cloud Storage), we need to configure CORS to allow requests from localhost, since we will be running it locally. Follow the following steps

Install gcloud CLI locally (for mac):
```
brew install --cask google-cloud-sdk
```

then authenticate:
```
gcloud auth login
```

then select you firebase project:
```
gcloud config set project <project-name>
```

then setup the cors:
```
gsutil cors set cors.json <firebase-storage-bucket-name>
```

##### Environment Files

.env file for `backend` is

```
DB_HOST=db
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=Files
DB_SYNC=true
FIREBASE_CONFIG_PATH=/secrets/firebase_config_key.json
FIREBASE_STORAGE_BUCKET=
```
(db credentials are already set in `docker-compose.yaml` file. Change them accordingly.)

.env file for `frontend` is

```
REACT_APP_API_KEY=
REACT_APP_AUTH_DOMAIN=
REACT_APP_PROJECT_ID=
REACT_APP_STORAGE_BUCKET=
REACT_APP_MESSAGE_SENDER_ID=
REACT_APP_APP_ID=
REACT_APP_BACKEND_URL=http://localhost:3000
```
(firebase app settings can be found at `Settings > Project settings > General`)

After completing the above setups, we can start the app. Since the entire app is dockerized,

```
docker compose up
```

will spin up the database, backend and frontend applications.

The app can be viewed at `http://localhost:5173`
