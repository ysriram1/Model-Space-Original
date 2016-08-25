# this extracts the lines from the userdata data structure
# * userdata is uid -> lines -> [ {x1:_, y1:_, x2:_, y2:_, info:_ } ]
# * linedata is [ { user->uid, rest_is_the_same } ]
userLines = (userdata) ->
    linedata = []
    for uid, udat of userdata
        for entry in udat['lines']
            entry.user = uid
            linedata.push entry
            
    return linedata

window.userLines = userLines
