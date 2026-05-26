pipeline {
    agent any

    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'prod-main', description: 'Branch to build')
    }

    environment {
        NODE_VERSION = '20'
        NVM_DIR = '/var/lib/jenkins/.nvm'
    }

    stages {

        stage('Clone Repository') {
            steps {
                deleteDir()

                git branch: "${BRANCH_NAME}",
                    url: 'https://github.com/NIUANULP/nulp-elite-ui.git'
            }
        }

        stage('Build') {
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
