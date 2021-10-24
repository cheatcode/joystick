## Joystick

The full-stack framework for JavaScript


### Table of Contents
1. What is Joystick?
2. Getting Started
3. Installation
4. Folder and file structure
5. Settings
   - Defining settings per environment
   - Defining Joystick configuration
   - Defining global settings
   - Defining client settings
   - Defining server settings
6. Databases
   - Adding a database
   - MongoDB
   - Adding a remote database
7. @joystick.js/cli
   - joystick create
   - joystick start
   - joystick build
8. @joystick.js/ui
   - Writing a component
   - Props
   - State
   - Lifecycle methods
   - Methods
   - DOM Events
   - CSS
   - Render functions
     - component() and c()
     - each() and e()
     - i18n() and i() 
     - when() and w()
   - Accessing URL and query params
   - Writing comments
   - Uploading files
9. @joystick.js/node
   - Startup
     - Defining an app
     - Accessing the Express instance
   - Middleware
     - Configuring built-in middleware
     - Adding custom middleware
   - Routes
     - Defining routes
     - Defining routes for specific HTTP methods
     - req.context.ifLoggedIn()
     - req.context.ifNotLoggedIn()
     - res.render()
       - Rendering a page
       - Rendering in a layout 
       - Passing props for SSR
       - Setting metadata for SEO
   - API
     - Getters
     - Setters
     - Validating inputs
     - get()
     - set()
     - Customizing outputs
   - Uploaders
     - Defining an uploader
   - Handling process events
10. Deployment
    - Using Docker
    - joystick deploy
11. Advanced Topics
    - Internationalization
      - Adding a language file
      - Accessing translations
