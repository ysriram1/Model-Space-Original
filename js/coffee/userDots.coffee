# this converts the userdata data structure to the dotdata
# data structure needed for drawing
# * userdata is uid -> DFs -> [ (time, (layoutx,y), [terms] ) ]
# * dotdata is [ { x->xval, y->yval, user->uid, terms->[terms] } ]

userDots = (userdata) ->
    dotdata = []
    for uid, udat of userdata
        console.log("dotprocess user " + uid)
        for i, entry of udat['DFs']
            console.log(i + ".")
            newEntry = {}
            newEntry.user = uid
            newEntry.x = entry[1][0]
            newEntry.y = entry[1][1]
            newEntry.info = entry[2]
            dotdata.push newEntry
            
    return dotdata

window.userDots = userDots
