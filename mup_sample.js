module.exports = {
	servers: {
		one: {
			host: "123.467.789.100",
			username: 'root',
			password: 'your-password-goes-here'
			// pem:
			// password:
			// or leave blank for authenticate from ssh-agent
		}
	},

	meteor: {
		name: 'lets-eat',
		path: '/Users/phil/Projects/lets-eat',
		docker: {
			image: 'abernix/meteord:base'
		},
		servers: {
			one: {}
		},
		buildOptions: {
			serverOnly: true,
		},
		env: {
			ROOT_URL: 'http://lets-eat.jointheleague.org',
			MONGO_URL: 'mongodb://localhost/meteor'
		},

		deployCheckWaitTime: 60
	},

	mongo: {
		oplog: true,
		port: 27017,
		servers: {
			one: {},
		},
	},
};