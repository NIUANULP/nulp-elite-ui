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
                // Install dependencies and build
                sh '''
                    #!/bin/bash
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                    export NVM_DIR="$HOME/.nvm"
                    if [ -s "$NVM_DIR/nvm.sh" ]; then
                        . "$NVM_DIR/nvm.sh"
                    fi
                    if [ -s "$NVM_DIR/bash_completion" ]; then
                        . "$NVM_DIR/bash_completion"
                    fi
                    nvm install $NODE_VERSION
                    nvm use $NODE_VERSION
                    yarn install
                    yarn build
                    cp -r /var/lib/jenkins/workspace/Build/Core/dist /var/lib/jenkins/workspace/Build/Core/elite-ui/prod/
                '''
            }
        }
    }
}
