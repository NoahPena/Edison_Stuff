var bleno = require('bleno');

var psTree = require('ps-tree');



var kill = function (pid, signal, callback) 
{
    signal   = signal || 'SIGKILL';
    callback = callback || function () 
    {

    };
    var killTree = true;
    if(killTree) 
    {
        psTree(pid, function (err, children) 
        {
            [pid].concat(children.map(function (p) 
            {
                    return p.PID;
            })
            ).forEach(function (tpid) 
            {
                try 
                { 
                	process.kill(tpid, signal) 
                }
                catch (ex) 
                { 

                }
            });
            callback();
        });
    } 
    else 
    {
        try 
        { 
        	process.kill(pid, signal) 
        }
        catch (ex) 
        { 

        }
        callback();
    }
};

var proc; //= require('child_process').exec('padsp sox --buffer 1024 -d -d');

bleno.on('stateChange', function(state)
{
	console.log('State change: ' + state);
	if(state === 'poweredOn')
	{
		bleno.startAdvertising('Multi-Effect Guitar Pedal', ['1337']);
	}
	else
	{
		bleno.stopAdvertising();
	}
});


bleno.on('accept', function(clientAddress)
{
	console.log('Accepted connection from address: ' + clientAddress);
});


bleno.on('disconnect', function(clientAddress)
{
	console.log('Disconnected from address: ' + clientAddress);
});


bleno.on('advertisingStart', function(error)
{
	if (error)
	{
		console.log('Advertising start error: ' + error);
	}
	else
	{
		console.log('Advertising start success');
		
		proc = require('child_process').exec('padsp sox --buffer 1024 -d -d');

		bleno.setServices([

				new bleno.PrimaryService(
				{
					uuid : '1337',
					characteristics : [
						
						new bleno.Characteristic(
						{
							value : null,
							uuid : '6969',
							properties : ['notify', 'read', 'write'],

							onSubscribe : function(maxValueSize, updateValueCallback)
							{
								console.log('Device subscribed');
							//	this.intervalId = setInterval(function()
							//	{
							//		console.log('Sending: Hi!');
							//		updateValueCallback(new Buffer('Hi!'));
							//	}, 1000);
							},

							onUnsubscribe : function()
							{
								console.log('Device unsubscribed');
							//	clearInterval(this.intervalId);
							},

							onReadRequest : function(offset, callback)
							{
								console.log('Read request received');
								callback(this.RESULT_SUCCESS, new Buffer('Echo: ' + (this.value ? this.value.toString('utf-8') : '')));
							},

							onWriteRequest : function(data, offset, withoutResponse, callback)
							{
								this.value = data;
								console.log('Write request: value = ' + this.value.toString('utf-8'));

								kill(proc.pid);

								proc = require('child_process').exec('padsp sox --buffer 1024 -d -d ' + this.value);

								callback(this.RESULT_SUCCESS);
							}

						})
					]
				})
		]);
	}
});
