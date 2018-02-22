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
   
    while true do
        local data,typ,err = wb:recv_frame()
        if wb.fatal then
                ngx.log(ngx.ERR, "failed to receive frame: ", err)
                return ngx.exit(444)
        end

        --if not data then
        --      local bytes, err = wb:send_ping()
        --      if not bytes then
        --              ngx.log(ngx.ERR, "failed to send ping: ", err)
        --              return ngx.exit(444)
        --      end

        if typ == "text" then
        --local bytes, err = wb:send_text(data)

            local comm=string.sub(data,1,3)
            local robotName=string.sub(data,4,4)
	    local message="STATUE"
            if comm=="GET" then
                res, err, errcode, sqlstate =
                    db:query("select latitude from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select longitude from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select altitude from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select linearx from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select lineary from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select linearz from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select angularx from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select angulary from robots where id="..robotName.."")
		message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select angularz from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select positionx from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select positiony from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select positionz from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select orientationx from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select orientationy from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select orientationz from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select linearAccx from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select linearAccy from robots where id="..robotName.."")
                message=message..cjson.encode(res)
                res, err, errcode, sqlstate =
                    db:query("select linearAccz from robots where id="..robotName.."")
                message=message..cjson.encode(res)

		wb:send_text(message)
         
	    elseif comm=="IMG" then
		res, err, errcode, sqlstate =
		    db:query("select image from robots where id=1")
                image=cjson.encode(res)
		wb:send_binary(image)

	    elseif comm=="SET" then
		
		res, err, errcode, sqlstate =
		    db:query("update robots set command="..'"'..data..'"'.." where id="..robotName.."")
		if not res then
		    wb:send_text("update command fail")
		else
		    wb:send_text("update command success")
		end      
            else
                wb:send_text("command fail")
            end


        elseif typ == "close" then
                break
        end
    end



