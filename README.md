# Betaki Website (Angular)

This project is the frontend for the Betaki website, built with [Angular CLI](https://github.com/angular/angular-cli).

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (which includes npm)
- [Angular CLI](https://angular.dev/tools/cli)
- [Docker](https://www.docker.com/products/docker-desktop) (for Docker-based setup)

## Running the Project

You can run this project either locally on your machine or within a Docker container.

### Local Development

1. **Install Dependencies:**
   Clone the repository and install the necessary npm packages.

   ```bash
   git clone <repository-url>
   cd website-angular
   npm install
   ```

2. **Start the Development Server:**
   Run the following command to start the Angular development server.

   ```bash
   ng serve
   ```

   The application will be available at `http://localhost:4200/` and will automatically reload if you change any of the source files.

### Docker-Based Development

The following commands allow you to build and run the application using Docker.

1. **Build the Docker Image:**
   This command builds the Docker image based on the `Dockerfile` in the project root.

   ```bash
   docker build -t spanol/betaki-staging:latest .
   ```

2. **Run the Docker Container:**
   This command runs the application inside a Docker container and maps the port to your local machine.

   ```bash
   docker run -p 8080:80  spanol/betaki-staging:latest
   ```

   The application will be available at `http://localhost:4200/`.

3. **(Optional) Push the Image to a Registry:**
   If you need to share the image or deploy it, you can push it to a Docker registry (like Docker Hub).

   ```bash
   docker push spanol/betaki-staging:latest
   ```

## Development Tools

### Code Scaffolding

To generate a new component, run:

```bash
ng generate component <component-name>
```

You can also generate directives, pipes, services, classes, guards, interfaces, enums, and modules.

### Building for Production

To build the project for production, run:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

### Running Unit Tests

To execute the unit tests via [Karma](https://karma-runner.github.io), run:

```bash
ng test
```

## Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
