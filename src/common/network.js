var ServerStatus = Object.freeze({
	Closed: 0,
	Starting: 1,
	Started: 2,
	Error: 99
});
var ConnectionStatus = Object.freeze({
	Closed: 0,
	Connecting: 1,
	Connected: 2,
	Error:99
});
var Network = {};
Network.Utils = (function () {
	var encodeIp = function (ip) {
		let res = ip.split(':');
		let bytePart = res[0].split('.');
		for (var i = 0; i < bytePart.length; i++) {
			console.log(parseInt(bytePart[i], 16));
		}
	};
	var ip2int=function(ip) {
		return ip.split('.').reduce(function (ipInt, octet) { return (ipInt << 8) + parseInt(octet, 10); }, 0) >>> 0;
	};
	var int2ip = function (ipInt) {
		return (ipInt >>> 24) + '.' + (ipInt >> 16 & 255) + '.' + (ipInt >> 8 & 255) + '.' + (ipInt & 255);
	};
	var mPublic = {
		ip2int: ip2int,
		int2ip: int2ip
	};
	return mPublic;
}());
Network.Host = (function () {

	var status = ServerStatus.Closed;

	var httpd = null;
	var serverUrl = null;

	var clientCallbacks = {
		'start': undefined,
		'stop': undefined,
		'error': undefined
	};

	var setCallbacks = function (callbacks) {
		for (var call in clientCallbacks) {
			if (callbacks[call])
				clientCallbacks[call] = callbacks[call];
		}
	};

	var getUrl = function () {
		return serverUrl;
	};

	var initialize = function () {
		httpd = cordova && cordova.plugins && cordova.plugins.CorHttpd ? cordova.plugins.CorHttpd : null;
	};

	var getStatus = function () {
		return status;
	};

	var updateStatus = function () {
		if (httpd) {
			httpd.getUrl(function (url) {
				if (url.length > 0) {
					serverUrl = url;
				}
				else {
					status = ServerStatus.Closed;
				}
			});
		}
	};
	var canHost = function () {
		return httpd !== null;
	};

	var serverStarted = function (url) {
		status = ServerStatus.Started;
		serverUrl = url;
		if (clientCallbacks.start)
			clientCallbacks.start();
	};

	var serverError = function (event)
	{
		console.log('Server Error: ' + event);
		status = ServerStatus.Error;
		if (clientCallbacks.error)
			clientCallbacks.error();
	};

	var serverStopped = function (event) {
		status = ServerStatus.Closed;
		if (clientCallbacks.stop)
			clientCallbacks.stop();
	};

	var start = function (path = '')
	{
		console.log('staring server ');
		if (httpd !== null)
		{
			if (status !== ServerStatus.Started) {
				status = ServerStatus.Starting;
				httpd.startServer({
					'www_root': path,
					'port': 8080,
					'localhost_only': false
				}, serverStarted, serverError);
			}
		}
		else {
			console.log('error staring server ');
		}
	};

	var stop = function () {
		if (httpd !== null) {
			httpd.stopServer(serverStopped, serverError);
		}
	};

	var mPublic = {
		initialize: initialize,
		getStatus: getStatus,
		getUrl: getUrl,
		start: start,
		stop: stop,
		updateStatus: updateStatus,
		setCallbacks: setCallbacks
	};

	return mPublic;
}());

Network.ClassicClient = (function ()
{
	var socket = null;
	var status = ConnectionStatus.Closed;

	var clientCallbacks = {
		'start': undefined,
		'stop': undefined,
		'error': undefined,
		'closed': undefined,
		'message': undefined
	};

	var setCallbacks = function (callbacks) {
		for (var call in clientCallbacks) {
			if (callbacks[call])
				clientCallbacks[call] = callbacks[call];
		}
	};

	var connected = function (event) {
		status = ConnectionStatus.Connected;
		console.log('Connected ' , event);

		if (clientCallbacks.start)
			clientCallbacks.start();
	};

	var messageIn = function (event) {
		console.log("Client message " + event);
		if (clientCallbacks.message)
			clientCallbacks.message(event);
	};

	var failed = function (event) {
		status = ConnectionStatus.Error;
		if (clientCallbacks.error)
			clientCallbacks.error(event);
	};

	var closed = function (event) {
		status = ConnectionStatus.Closed;
		if (clientCallbacks.closed)
			clientCallbacks.closed();
	};

	var send = function (msg)
	{
		console.log("Sending message to server ", msg);
		socket.send(msg);
	};

	var close = function (code, reason) {
		socket.close();
	};

	var connect = function (url)
	{
		status = ConnectionStatus.Connecting;
		console.log('Connecting to ' + url);
		socket = new WebSocket('ws://' + url);

		socket.onclose=closed;
		socket.onerror=failed;
		socket.onmessage=messageIn;
		socket.onopen=connected;
	};

	var getStatus = function () {
		return status;
	};

	var mPublic = {
		connect: connect,
		close: close,
		send: send,
		getStatus: getStatus,
		setCallbacks: setCallbacks
	};

	return mPublic;
}());

Network.Server = (function () {
	var connectionInfo = {
		'address': undefined,
		'port': 10550
	};
	var wsServer = null;
	var serverStatus = ServerStatus.Closed;
	var serverCallbacks = {
		'start': undefined,
		'stop': undefined,
		'error': undefined,
		'connection': undefined,
		'closed': undefined,
		'message': undefined,
		'send': undefined
	};

	var initialize = function ()
	{
		wsServer = cordova.plugins.wsserver;
	};

	var setCallbacks = function (callbacks) {
		for (var call in serverCallbacks) {
			if (callbacks[call])
				serverCallbacks[call] = callbacks[call];
		}
	};

	var serverStarted = function (addr, port)
	{
		console.log("server started ",addr, port);
		serverStatus = ServerStatus.Started;

		wsServer.getInterfaces(function (result) {
			for (var inter in result) {
				if (result.hasOwnProperty(inter)) {
					connectionInfo.address = result[inter].ipv4Addresses[0];
					break;
				}
			}

			if (serverCallbacks.start)
				serverCallbacks.start(connectionInfo);
		});

		
	};

	var serverClosed = function (conn, code, reason, wasClean) {
		console.log('A user disconnected from %s', conn.remoteAddr);
		serverStatus = ServerStatus.Closed;
		if (serverCallbacks.closed)
			serverCallbacks.closed(conn, code, reason, wasClean);
	};

	var serverFailed = function (addr, port, reason) {
		serverStatus = ServerStatus.Error;
		console.log('Stopped listening on %s:%d. Reason: %s', addr, port, reason);
		if (serverCallbacks.error)
			serverCallbacks.error(addr, port, reason);
	};

	var messageArrived = function (conn, msg) {
		console.log("Connection"+conn);
		console.log("New message" + msg);
	};

	var serverStartFailed = function (reason) {
		serverStatus = serverStatus.ServerStatus.Error;
		console.log('Did not start. Reason: %s', reason);
		if (serverCallbacks.error)
			serverCallbacks.error(null, null, reason);
	};

	/*conn: {
		'uuid' : '8e176b14-a1af-70a7-3e3d-8b341977a16e',
		'remoteAddr' : '192.168.1.10',
		'httpFields' : {...},
		'resource' : '/?param1=value1&param2=value2'
	} */
	var serverOpen = function (conn)
	{
		wsServer.send(conn, "Welcome");
		if (serverCallbacks.connection)
			serverCallbacks.connection(conn);
	};

	var startServer = function () {
		console.log('starting server');

		if (!wsServer) {
			if (serverCallbacks.error)
				serverCallbacks.error(null, null, 'No server');

			console.log('Error starting server');
		}
		else {
			serverStatus = ServerStatus.Starting;
			console.log('ok: starting server');
			wsServer.start(connectionInfo.port, {
				'onFailure': serverFailed,
				'onOpen': serverOpen,
				'onMessage': messageArrived,
				'onClose': serverClosed,
				'tcpNoDelay': true
			}, serverStarted, serverStartFailed);
		}
	};

	var stopServer = function () {
		serverStatus = ServerStatus.Stopped;
		wsServer.stop(serverClosed, serverFailed);
	};

	var getInterfaces = function () {
		wsServer.getInterfaces(function (result) {
			for (var inter in result) {
				if (result.hasOwnProperty(inter)) {
					console.log('interface', inter);
					console.log('ipv4', result[inter].ipv4Addresses);
					console.log('ipv6', result[inter].ipv6Addresses);
				}
			}
		});
		console.log(connectionInfo);
	};

	var getServerStatus = function () {
		return serverStatus;
	};

	var isNetworkCapable = function () {
		if (cordova in window)
			if (cordova.plugins)
				if (cordova.plugins.wsserver)
					return true;
		return false;
	};

	var mPublic = {
		getServerStatus: getServerStatus,
		startServer: startServer,
		stopServer: stopServer,
		isNetworkCapable: isNetworkCapable,
		initialize: initialize,
		getInterfaces: getInterfaces,
		setCallbacks: setCallbacks
	};

	return mPublic;
}());