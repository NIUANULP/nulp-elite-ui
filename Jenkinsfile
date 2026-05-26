pipeline {
    agent any
    
    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'prod-main', description: 'Branch to build')
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                // Clean workspace before cloning
                deleteDir()

                // Clone repository with the parameterized branch
                git branch: "${BRANCH_NAME}", url: 'https://github.com/NIUANULP/nulp-elite-ui.git'
            }
        }
        stage('Build') {
            environment {
                // Define the Node.js version to use
                NODE_VERSION = '20' // Adjust this to your desired Node.js version
                NVM_DIR = '/var/lib/jenkins/.nvm'
            }
            steps {

                sh '''
                    #!/bin/bash
                    set -e

                    export NVM_DIR="/var/lib/jenkins/.nvm"

                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                    echo "Requested Node Version: $NODE_VERSION"

                    nvm install $NODE_VERSION
                    nvm use $NODE_VERSION

                    echo "Node Version:"
                    node -v

                    echo "NPM Version:"
                    npm -v

                    yarn install
                    yarn build

                    cp -r /var/lib/jenkins/workspace/Build/Core/dist /var/lib/jenkins/workspace/Build/Core/elite-ui/prod/
                '''
            }
        }
    }
}
