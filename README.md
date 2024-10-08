# EasyAccount

EasyAccount serves as the foundation for all future projects within Hydra ecosystem. It provides a standardized authentication solution, reducing development time and effort required for implementing authentication features in new projects.

> [How to start development:](#dev)

> [How to use the API:](#routes)

<a name="dev"></a>
## How to start development:

Warning: Before start development, please read the `development patterns` on [trello](https://trello.com/b/qx2R8rNb/easyaccount)!

> [Windows](#windows)

> [Linux](#linux)


<a name="windows"></a>
### Windows:
> ##### How start development on Windows:
**Requirements:**

- [node.js v20](https://nodejs.org/en/download/)

- [mongodb v7.0](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5-signed.msi) or [docker v25.0](https://www.docker.com/products/docker-desktop/)

Clone the project.

Install required packages into the project. In the project folder, use the following command in the terminal:

  ```
npm start
  ```

Copy the `.env.example` to `.env`:
  ```
cp .env.example .env
  ```
If you are using local **mongodb**, run this command in another terminal:
  ```
mongod
  ```

<blockquote> 
<details>
  <summary> Click here if you're having problems with the command "mongod" (on Windows)</summary>
  <blockquote> 
   
    Reinstall MongoDB as usual and wait until Compass appears. If it doesn't, uninstall and reinstall. 
    Copy the installation path; we'll need it.
    Open a command prompt (cmd.exe) as an administrator.
    Type: cd C:\
    Then: md "\data\db"
    After that: "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="c:\data\db"
    Press "CTRL+C" and close cmd.exe.
    Copy the installation path up to the "bin" folder, for example: C:\Program Files\MongoDB\Server\YOUR_MONGODB_VERSION\bin
    Go to system properties and add to the system environment variables (search on Google) in "PATH":
    Double-click on PATH in "System Environment Variables".
    Click on "New"
    Paste the copied path and click OK.
 </blockquote>
</details>
</blockquote>

If you are using **docker**, run this command:
  ```
docker-composer up -d
  ```

Run the project:

  ```
npm start
  ```

<a name="linux"></a>
### Linux:
> #####  How start development on Linux:
**Requirements:**

- [node.js v20](https://nodejs.org/en/download/)

- [mongodb v7.0](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5-signed.msi) or [docker v25.0](https://www.docker.com/products/docker-desktop/)

Clone the project.

Install required packages into the project. In the project folder, use the following command in the terminal:

  ```
npm install
  ```

Copy the `.env.example` to `.env`:
  ```
cp .env.example .env
  ```

If you are using local **mongodb**, run this command in another terminal:

  ```
mongod
  ```
If you are using **docker**, run this command:
  ```
docker-composer up -d
  ```

Run the project (in the project folder, use the following command):

  ```
npm start
  ```

<a name="routes"></a>
## How to use the API (routes):

Change `NODE_ENV='prod'` variable in `.env` to  `NODE_ENV='dev'`

Acess: http://localhost:3000/api-docs/


## Authors:
- [Katson](https://github.com/katson1)
- [Arimateia](https://github.com/arimateia98)
- [Lucas](https://github.com/lucasjarrier)
