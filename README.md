## Free Market Fandango

A stock market themed party where drink choices and events affect prices.

### API

This project contains the Free Market Fandango API which serves the frontend.

The API was originally written using an on-prem MariaDB server, it is being migrated to use DynamoDB.  It is written 
with FastAPI and runs as a Lambda function, invoked using API Gateway.

The root of this project contains the CDK files to deploy the API on AWS, the `free-market-fandango-api` directory 
contains the actual Lambda code.

### Environment variables

The following environment variables are required:

- `ADMIN_PASSWORD`: admin password required to authenticate in the admin panel.

#### License

Licensed under the GNU General Public License v3.0.

```
Free Market Fandango - A stock market themed party
Copyright (C) 2024 Dylan Wilson

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

Full license available [here](https://gitlab.dylanw.dev/free-market-fandango/api/-/raw/main/LICENSE).
