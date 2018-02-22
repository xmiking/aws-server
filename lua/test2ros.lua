local server = require "resty.websocket.server"
local mysql = require "resty.mysql"
local cjson = require "cjson"

    local wb, err = server:new{
        timeout = 5000,  -- in milliseconds
        max_payload_len = 65535,
    }
    if not wb then
        ngx.log(ngx.ERR, "failed to new websocket: ", err)
        return ngx.exit(444)
    end

    local db, err = mysql:new()
    if not db then
        ngx.log(ngx.ERR,"failed to instantiate mysql: ", err)
        return
    end
    db:set_timeout(1000) -- 1 sec
    local ok, dberr, errcode, sqlstate = db:connect{
        host = "127.0.0.1",
        port = 3306,
        database = "ngx_test",
        user = "root",
        password = "12345",
        charset = "utf8",
        max_packet_size = 1024 * 1024,
    }
        if not ok then
          ngx.log(ngx.ERR,"failed to connect: ", dberr, ": ", errcode, " ", sqlstate)
          return
        end


        local data, typ, err = wb:recv_frame()
        if wb.fatal then
              ngx.log(ngx.ERR, "failed to receive frame: ", err)
              return ngx.exit(444)
        end

        if ok then 
          wb:send_text("connect to mysql success")
        else
          wb:send_text("connect to mysql fail")
        end  



    while true do

        local data,typ,err = wb:recv_frame()
        if wb.fatal then
                ngx.log(ngx.ERR, "failed to receive frame: ", err)
                return ngx.exit(444)
        end

        if typ == "text" then
        --local bytes, err = wb:send_text(data)

            local comm=string.sub(data,1,3)
            local robotName=string.sub(data,4,4)
   
            if comm=="ROS" then
                local roscomm=string.sub(data,5,7)
                local pause1=string.find(data,",")
                local message1=string.sub(data,8,pause1-1)
                local pause2=string.find(data,",",pause1+1)
                local message2=string.sub(data,pause1+1,pause2-1)
                local message3=string.sub(data,pause2+1,-1)
                if roscomm =="GPS" then
                    res, err, errcode, sqlstate =
                        db:query("update robots set latitude="..message1..",longitude="..message2..",altitude="..message3.." where id="..robotName.."")
			if not res then
                        	wb:send_text("gps update fail")
			end
                elseif roscomm=="Lin" then
                    res, err, errcode, sqlstate =
                        db:query("update robots set linearx="..message1..",lineary="..message2..",linearz="..message3.." where id="..robotName.."")
                        if not res then
                                wb:send_text("Lin update fail")
                        end

                elseif roscomm=="Pos" then
                    res, err, errcode, sqlstate =
                        db:query("update robots set positionx="..message1..",positiony="..message2..",positionz="..message3.." where id="..robotName.."")
                        if not res then
                                wb:send_text("Pos update fail")
                        end

                elseif roscomm=="Ori" then
                    res,err,errcode,sqlstate =
                        db:query("update robots set orientationx="..message1..",orientationy="..message2..",orientationz="..message3.." where id="..robotName.."")
                        if not res then
                                wb:send_text("Ori update fail")
                        end

                elseif roscomm=="LiA" then
                    res,err,errcode,sqlstate =
                        db:query("update robots set linearAccx="..message1..",linearAccy="..message2..",linearAccz="..message3.." where id="..robotName.."")
		end          
                        if not res then
                                wb:send_text("Lia update fail")
                        end



	    elseif comm=="GET" then
		res, err, errcode, sqlstate =
			db:query("select command from robots where id="..robotName.."")
		local commandstr=cjson.encode(res)
		commandstr = string.sub(commandstr,13,-3)
		if  commandstr == "null" then
		   wb:send_text(commandstr)
		else
		   wb:send_text(string.sub(commandstr,2,-2))
		   res, err, errcode, sqlstate = 
	 	      db:query("update robots set command=NULL where id="..robotName.."")
		end
	
            else
                wb:send_text("command fail")
            end
	elseif typ == "binary" then
	    local file,err = io.open("/usr/servers/nginx/html/pic/trans_image.jpeg","w+")
	   	if file then
		 file:write(data)
	         file:close()
		wb:send_text("imgS")
	    	else
		 wb:send_text("err: "..err)
		end
        elseif typ == "close" then
		break
        end
    end




