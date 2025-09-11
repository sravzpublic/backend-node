var nsq = require('nsqjs'),
	config = require('../../config/config'),
	cacheUtil = require('../cache/util'),
	crypto = require('crypto');

var NsqReaderWriter = function (app) {
	function NsqReaderWriter() {
		config.app.nsq_host = config.app.nsq_host.split(',')[config.app.nsq_host.split(',').length * Math.random() | 0]
		console.log(`Writer: Connecting to NSQD host at ${config.app.nsq_host}`)
		this.nsqWriter = new nsq.Writer(config.app.nsq_host.split(':')[0], config.app.nsq_host.split(':')[1]);
		this.nsqWriter.on('ready', () => {
		})
		this.nsqWriter.on('closed', () => {
			console.log('Writer closed')
		})
		this.io = app.get('socketio');
		this.writeToNSQAndHandleResponse = function (nsq_request, topic) {
			self = this;
			var topicUsed = config.app.BACKEND_PY_TOPIC;
			if (topic == 'rust_backend') {
				topicUsed = config.app.BACKEND_RUST_TOPIC;
			}
			if (!this.nsqWriter.ready) {
				this.nsqWriter.connect()
			}
			if (!this.nsqReader.isClosed) {
				this.nsqReader.connect()
			}
			this.nsqWriter.publish(topicUsed, nsq_request, err => {
				if (err) { return console.error(err.message) }
				console.log(`NSQ Writer: Message sent on topic ${topicUsed}: NSQ Request: ${JSON.stringify(nsq_request)}`)
			})
		}

		this.createNSQMessage = function (data, topic, socket) {
			return JSON.stringify({
				"id": data.messageid,
				"p_i": {
					"args": data.args,
					"kwargs": data.kwargs
				},
				"t_o": config.app.BACKEND_NODE_TOPIC,
				"cid": socket.id,
				"cache_message": true,
				'stopic': topic
			});
		};

		this.sendNSQMessage = function (data, topic, socket) {
			self = this;
			// Writes a message to the stream1
			this.checkCacheAndSendDataOnSocket(data, topic, socket, (err) => {
				if (err) {
					data = JSON.parse(data);
					var nsq_request = self.createNSQMessage(data, topic, socket);
					self.writeToNSQAndHandleResponse(nsq_request, topic);
				}
			})
		};

		this.getHash = function (key) {
			return crypto.createHash('md5').update(key).digest("hex");
		}

		this.checkCacheAndSendDataOnSocket = function (data, topic, socket, callback) {
			data = JSON.parse(data);
			self = this;
			args_str = "";
			if (data.args) {
				args_str = data.args.join('_');
			}
			key = this.getHash(data.messageid + topic + args_str + JSON.stringify(data.kwargs));
			cacheUtil.getItem(key, (err, cacheData) => {
				if (err) {
					console.log(`NSQ mesage for key: ${key} not found in cache ${err}`);
					callback(err)
				}
				if (cacheData) {
					if (cacheData.e != "Error") {
						console.log(`NSQ mesage for key: ${key} found in cache, sent on socket ${socket.id}: data ${JSON.stringify(cacheData)}`);
						self.io.sockets.in(socket.id).emit(topic, cacheData);
					} else {
						console.log(`NSQ message found in cache but has an error: Message: ${JSON.stringify(cacheData)} Key: ${key}  Error: ${cacheData.e}`);
						callback(true)
					}
				} else {
					callback(null)
				}

			})
		}

		this.cacheNSQMessage = function (data, topic, nsqMessage, callback) {
			// Caches retry later messages, so don't cache any error message
			if (nsqMessage.e != "") {
				const sortedKwargs = data.p_i.kwargs ?
					Object.keys(data.p_i.kwargs)
						.sort()
						.reduce((obj, key) => {
							const value = data.p_i.kwargs[key];
							obj[key.toLowerCase()] = typeof value === 'string' ? value.toLowerCase() : value;
							return obj;
						}, {}) :
					{};
				key = this.getHash(data.id + topic + data.p_i.args.join('_') + JSON.stringify(sortedKwargs));
				/* Put message should be string */
				cacheUtil.putItem(key, nsqMessage, (err) => {
					if (err) {
						console.log(`NSQ mesage for key: ${key} message: ${nsqMessage} could not be saved to cache ${err}`);
						callback(err)
					}
					console.log(`NSQ mesage for key: ${key} saved to cache. message: ${nsqMessage}`);
					callback(null)
				})
			} else {
				console.log(`Error in NSQ message: NSQ message: ${nsqMessage} with key: ${key} not saved to cache`);
			}

		}
	}

	NsqReaderWriter.prototype.onClientConnection = function (socket) {
		var self = this;

		// Used by all requests
		socket.on('pca', function (data) {
			console.log(`SOCKET.IO: PCA Topic: Received data from browser : Socket: ${socket.id} Data: ${data}`)
			self.sendNSQMessage(data, 'pca', socket)
		});

		// Combined graph
		socket.on('combinedchart', function (data) {
			console.log("Requesting combined graph for :" + data)
			self.sendNSQMessage(data, 'combinedchart', socket)
		});

		// Rolling stats
		socket.on('rollingstats', function (data) {
			console.log("Requesting rolling stats for :" + data)
			self.sendNSQMessage(data, 'rollingstats', socket)
		});

		// Rolling stats
		socket.on('dftest', function (data) {
			console.log("Requesting df stats for :" + data)
			self.sendNSQMessage(data, 'dftest', socket)
		});


		// Get get_df_stats_by_sravz_id
		socket.on('get_df_stats_by_sravz_id', function (data) {
			console.log("Requesting get_df_stats_by_sravz_id stats for :" + data)
			self.sendNSQMessage(data, 'get_df_stats_by_sravz_id', socket)
		});

		socket.on('get_returns_tear_sheet', function (data) {
			console.log("Requesting get_returns_tear_sheet for :" + data)
			self.sendNSQMessage(data, 'get_returns_tear_sheet', socket)
		});

		// Used by all requests
		socket.on('rust_backend', function (data) {
			console.log(`SOCKET.IO: rust_backend Topic: Received data from browser : Socket: ${socket.id} Data: ${data}`)
			self.sendNSQMessage(data, 'rust_backend', socket)
		});

		// Join and leave rooms
		//:JOIN:Client Supplied Room
		socket.on('subscribe', function (room) {
			try {
				console.log('[socket]', 'join room :', room)
				socket.join(room);
				socket.to(room).emit('user joined', socket.id);
			} catch (e) {
				console.log('[error]', 'join room :', e);
				socket.emit('error', 'couldnt perform requested action');
			}
		})

		//:LEAVE:Client Supplied Room
		socket.on('unsubscribe', function (room) {
			try {
				console.log('[socket]', 'leave room :', room);
				socket.leave(room);
				socket.to(room).emit('user left', socket.id);
			} catch (e) {
				console.log('[error]', 'leave room :', e);
				socket.emit('error', 'couldnt perform requested action');
			}
		})

	}

	NsqReaderWriter.prototype.start = function () {
		var self = this;
		config.app.nsq_lookupd_host = config.app.nsq_lookupd_host.toString().split(',')
		console.log(`Connecting to lookupd addresses: ${config.app.nsq_lookupd_host}`);
		try {
			//self.consumer.connect();
			self.nsqReader = new nsq.Reader(config.app.BACKEND_NODE_TOPIC, config.app.BACKEND_NODE_TOPIC, {
				lookupdHTTPAddresses: config.app.nsq_lookupd_host
			})
			self.nsqWriter.connect()
			self.nsqReader.connect()
			self.nsqReader.on('message', msg => {
				console.log('NSQ Reader: Received message: Message ID: [%s]: RAW Message: %s', msg.id, msg.body.toString())
				kafkaMessage = msg.body.toString();
				var jsonData = JSON.parse(msg.body.toString())
				console.log("NSQ Reader: Received message: msg.body.toString()" + kafkaMessage);
				self.io.sockets.in(jsonData.cid).emit(jsonData.stopic, jsonData);
				console.log(`NSQ Reader: Message sent on the websocket`);
				self.cacheNSQMessage(jsonData, jsonData.stopic, kafkaMessage, (err) => {
					if (err) {
						console.log(`NSQ Reader: Error in message: NSQ message not saved to cache`);
					}
				})
				msg.finish()
			})
		} catch (err) {
			console.error(err)
			setTimeout(() => {
				console.log("Consumer error, restarting consumer...");
				self.start()
			}, 1000);
		}
	};

	var NsqReaderWriter = new NsqReaderWriter();
	return NsqReaderWriter;
};

module.exports = function (app) {
	app.set('NsqReaderWriter', NsqReaderWriter);
};