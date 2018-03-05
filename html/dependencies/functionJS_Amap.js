	/******************************************************
		Author: LI Mingqi
		Date: Nov 8, 2017
		Function: Connect with AWS server for collecting data from MySQL;
	*******************************************************/
	
	var wsUri = "ws://127.0.0.1:80/test2html";				//server IP
	var sh = setInterval("GetRobotInfo(g_robotName)",200);		//operate function"GetRobotInfo(g_robotName)" per 200ms
	var sh_Image = setInterval("GetImage()",500);
	var g_robotName="NULL";										//at most 9 robot to set (1-9)								
	var ConnectState='0';
	var map;
	var marker;
	/*set latitude and longitude as global variables, because the callback function cannot transter parameters.
	set initial gps coordinate as HKUST*/
	//var latitude= 22.338363;
	//var longitude= 114.263957;
	
	initMap();
	/*call when click "connect"*/
	function OnConnect()
	{	
        	initWebSocket();
		ConnectState='1';
		GetRobotInfo(document.getElementById('robotName').value);
    	}
	
    	function initWebSocket() 
	{
		websocket = new WebSocket(wsUri);
		websocket.onopen = function (evt) { onOpen(evt) };
		websocket.onclose = function (evt) { onClose(evt) };
		websocket.onmessage = function (evt) { onMessage(evt)};
		websocket.onerror = function (evt) { onError(evt) };
    	} 
	
	function onOpen(evt) 
	{
		document.getElementById('stateRed').style = "padding-left:10px;opacity:0.3;";
		document.getElementById('stateGreen').style = "padding-left:10px;opacity:1.0;";
	}
	
    	function onClose(evt) 
	{ 
		document.getElementById('stateRed').style = "padding-left:10px;opacity:1.0;";
		document.getElementById('stateGreen').style = "padding-left:10px;opacity:0.3;";
		ConnectState='0';
	}
	
    	function onError(evt) 
	{ 
		document.getElementById('result').value = evt.data; 
	}
	
    	function doSend(message) 
	{  
		if(ConnectState=='1')
			websocket.send(message); 
	}
	

	/*call when receive message*/
    	function onMessage(evt) 
	{ 
		if(ConnectState=='1')
		{
			var message = evt.data;
			//document.getElementById('result').value = evt.type; 
			if(evt.type == 'message')
			{
			//document.getElementById('result').value = message; 
			if(message == '[object Blob]')	
			{
				
				//document.getElementById('result').value = "receive blob"; 
			}
			//document.getElementById('result').value = message; 
			else if(message.indexOf("STATUE")==0)		//key word for state information
			{

				var indexla = message.substring(message.indexOf("latitude")+10,message.indexOf("}]",message.indexOf("latitude"))); //纬度
				var indexlo = message.substring(message.indexOf("longitude")+11,message.indexOf("}]",message.indexOf("longitude"))); //经度
				var indexal = parseFloat(message.substring(message.indexOf("altitude")+10,message.indexOf("}]",message.indexOf("altitude"))));
				//coordinate change
				$.getJSON("http://restapi.amap.com/v3/assistant/coordinate/convert",
				{
					key:"44f08ed55ac6f6969e3a3823545d6fb8",
					locations:indexlo+","+indexla,
					coordsys:"gps"
				},
				function(data)
				{
					var coordinateBack = data.locations;
					longitude = parseFloat(coordinateBack.substring(0,coordinateBack.indexOf(",")));
					latitude = parseFloat(coordinateBack.substring(coordinateBack.indexOf(",")+1));
					
					document.getElementById('latitude').value = latitude.toFixed(4);
					document.getElementById('longitude').value = longitude.toFixed(4);
					document.getElementById('altitude').value = indexal.toFixed(4);


				});
				
				

				var indexLinx = parseFloat(message.substring(message.indexOf("linearx")+9,message.indexOf("}]",message.indexOf("linearx"))));
				var indexLiny = parseFloat(message.substring(message.indexOf("lineary")+9,message.indexOf("}]",message.indexOf("lineary"))));
				var indexLinz = parseFloat(message.substring(message.indexOf("linearz")+9,message.indexOf("}]",message.indexOf("linearz"))));

				if(!isNaN(indexLinx) && !isNaN(indexLiny) && !isNaN(indexLinz))
				{
					var speed = Math.sqrt((indexLinx*indexLinx)+(indexLiny*indexLiny)+(indexLinz*indexLinz));
					document.getElementById('linearspeed').value = speed.toFixed(4)+" m/s";
					changeSpeed(speed);
				}
				else
				{
					document.getElementById('linearspeed').value = "Without linear speed info";
					changeSpeed(0);
				}
				
				

				var indexAngx = parseFloat(message.substring(message.indexOf("angularx")+10,message.indexOf("}]",message.indexOf("angularx"))));
				var indexAngy = parseFloat(message.substring(message.indexOf("angulary")+10,message.indexOf("}]",message.indexOf("angulary"))));
				var indexAngz = parseFloat(message.substring(message.indexOf("angularz")+10,message.indexOf("}]",message.indexOf("angularz"))));
				//operate data


				var indexPosx=parseFloat(message.substring(message.indexOf("positionx")+11,message.indexOf("}]",message.indexOf("positionx"))));
				var indexPosy=parseFloat(message.substring(message.indexOf("positiony")+11,message.indexOf("}]",message.indexOf("positiony"))));
				var indexPosz=parseFloat(message.substring(message.indexOf("positionz")+11,message.indexOf("}]",message.indexOf("positionz"))));
				//operate data
				if(isNaN(indexPosx) || isNaN(indexPosy) || isNaN(indexPosz))
				{
					var indexPosx = 0;
					var indexPosy = 0;
					var indexPosz = 0;
				}
				

				var indexOrix = parseFloat(message.substring(message.indexOf("orientationx")+14,message.indexOf("}]",message.indexOf("orientationx"))));
				var indexOriy = parseFloat(message.substring(message.indexOf("orientationy")+14,message.indexOf("}]",message.indexOf("orientationy"))));
				var indexOriz = parseFloat(message.substring(message.indexOf("orientationz")+14,message.indexOf("}]",message.indexOf("orientationz"))));
				//operate data

				if(isNaN(indexOrix) || isNaN(indexOriy) || isNaN(indexOriz))
				{
					var indexOrix = 0;
					var indexOriy = 0;
					var indexOriz = 0;
				}
				
				
				var indexLiAx = parseFloat(message.substring(message.indexOf("linearAccx")+12,message.indexOf("}]",message.indexOf("linearAccx"))));
				var indexLiAy = parseFloat(message.substring(message.indexOf("linearAccy")+12,message.indexOf("}]",message.indexOf("linearAccy"))));
				var indexLiAz = parseFloat(message.substring(message.indexOf("linearAccz")+12,message.indexOf("}]",message.indexOf("linearAccz"))));	
				//operate data
				changeDirection(indexPosx,-indexPosy,indexPosz,indexOrix,indexOriy,indexOriz);
				mapchange();

			}
			else 
			{
				document.getElementById('result').value = evt.data;
			}}
		}
	}
	
	/*function changeCoordinate()
	{
		$.getJSON(
		"http://restapi.amap.com/v3/assistant/coordinate/convert",
		{
			key:"d57dae9686cfa57721708ac1517c98a9",
			locations:"116.481499,39.990475",
			coordsys:"gps"
		},
		function(data)
		{
			alert(data.locations);
		}
		);
	}*/
	
    function initMap() 
	{
		/*set map*/
		map = new AMap.Map(document.getElementsByClassName('map')[0], 
		{
			resizeEnable: true,
			zoom:20,
			center: [114.268607,22.334477],      
		});
		map.setLang('zh_en');

		/*set marker*/
		marker = new AMap.Marker({
			map: map,
			position: [114.268607,22.334477],
			content: "<div class='arrow'>"+
			"<div class='side1'></div>"+
			"<div class='side2'></div>"+
			"<div class='side3'></div>"+
			"<div class='side4'></div>"+
			"<div class='side5'></div>"+
			"<div class='side6'></div>"+
			"<div class='side7'></div>"+
			"<div class='side8'></div>"+
			"<div class='sideline1'></div>"+
			"<div class='sideline2'></div>"+
			"<div class='sideline3'></div>"+
			"<div class='sideline4'></div>"+
			"</div>",
			offset: new AMap.Pixel(-50,-105),
		});
    }
	
	/*Map language modify*/
	['en', 'zh_en', 'zh_cn'].forEach(function(btn) {
	var button = document.getElementById(btn);
	AMap.event.addDomListener(button,'click',clickListener)
	});
	function clickListener() 
	{
		map.setLang(this.id);
	}
	
	/*reload GPS coordinate*/
	function mapchange()
	{		
		var pos = [longitude,latitude];
		map.setCenter(pos);
		marker.setPosition(pos);
		//var m_offset = new AMap.Pixel(-50,-105);
		//marker.setOffset(m_offset);
	}
	
	/*
		Change the direction of arrow
		x of arrow is up; y of arrow is east, z of arrow is north 
	*/
	function changeDirection(posx,posy,posz,x,y,z)
	{
		var list=document.getElementsByClassName("arrow");
		var zoomNum = map.getZoom();
		zoomNum=zoomNum/18* zoomNum/18 *zoomNum/18 *zoomNum/18 *zoomNum/18;
		for(var i = 0; i<list.length;i++) 
		{
			list[i].style = "transform: rotateY(90deg) rotateX(90deg) rotateY(-20deg) translate3d("+posz*zoomNum+"px,"+posx*zoomNum+"px,"+posy*zoomNum+"px) "+" rotateZ("+z+"rad)"+" rotateY("+y+"rad)"+" rotateX("+x+"rad)";
			
		};
	}
	/*Change angle of speed pin*/
	function changeSpeed(message)
	{
		var speed;
		if(message*6<360)
		{	
			speed=message*6;
		}
		else
		{
			speed=60*6;
			document.getElementById('result').value="Speed out of range";
		}
		var list=document.getElementsByClassName("speed-pin");
		for(var i = 0; i<list.length;i++) 
		{
			list[i].style = "transform: rotateZ(90deg) "+"rotateZ("+speed+"deg)";
 		};
		
	}
	/*
		Send message to server, get robot information.
		Get every 200ms when connecting.
		At most 9 robots to set (1-9)
	*/
	function GetRobotInfo(message)
	{
		if(ConnectState=='1')
		{
			g_robotName=message;
			switch(g_robotName)
			{
				case '1':
					document.getElementById('robotNameState').value="Car";
					break;
				case '2':
					document.getElementById('robotNameState').value="Boat";
					break;
				case 'NULL':
					break;
				default:
					document.getElementById('result').value="Robot name not exist!";
			}
			doSend('GET'+g_robotName);
			//can add more robot
		}
	}
	function GetImage()
	{
		if(ConnectState=='1')
		{
			doSend('IMG1');
		}
	}
	/*	
		send command to ros
		most 40 varchar in MySQL
	*/
	function Setrobot(type,x,y,z)
	{
		if(ConnectState='1')
		{
			if(!isNaN(parseFloat(x)) && !isNaN(parseFloat(y)) && !isNaN(parseFloat(z)))
			{	
				var temp1="SET"+g_robotName+type+parseFloat(x).toFixed(4)+","+parseFloat(y).toFixed(4)+","+parseFloat(z).toFixed(4);
				doSend(temp1);
				document.getElementById('hit').value="Send success!";
			}
			else
			{
				document.getElementById('hit').value="Number wrong!";
			}
		}
	}
