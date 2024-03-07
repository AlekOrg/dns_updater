pipeline {
    agent {
        kubernetes {
            inheritFrom 'docker'
        }
    }

    stages {
        stage('Build') {
            steps {
                container('docker') {
                    dir('src') {
                        sh 'docker compose build'
                    }
                }
            }
        }
        stage('Test') {
            steps {
                container('docker') {
                    dir('test') {
                        sh './test.sh'
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                container('docker') {
                    sh "docker image tag dns_updater:latest ${DISTRIBUTION_REPOSITORY_PATH}/dns_updater:latest"
                    sh "docker push ${DISTRIBUTION_REPOSITORY_PATH}/dns_updater:latest"
                }
                container('kubectl') {
                    sh 'kubectl apply -f k8s/deployment.yaml'
                }
            }
        }
    }
}
