mapColors = (dotdata, fClrsUsers) ->
    dResult = {}
    for uid, data of dotdata
        dResult[uid] = fClrsUsers(uid)

    return dResult

window.mapColors = mapColors
