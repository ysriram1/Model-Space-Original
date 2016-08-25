# this handles turning on the appropriate user selection based on
# selected user groups
# * T \in {'analyst', 'intern', 'se', 'other'}
markUsers = (T) ->
    # actual participant breakdown
    dUserGroups =
        professionals: [3,10]
        interns: [1,2,5,9,12]
        sande: [4,7,8,11,13]
        other: [6]

    # which way are we setting the user group
    bTurnOn = d3.select('#chkGrp' + T).property('checked')

    # check/uncheck appropriate boxes
    for uid in dUserGroups[T.toLowerCase()]
        d3.select('#chkU'+uid).property('checked', bTurnOn)
        updateVisVisible(uid)


# checks if an individual user is checked
# NB: uses 'elem' from ModelSpace.html
userChecked = (uid) ->
    elem('chkU' + uid).checked;


# update individual visibility of users in the vis
updateVisVisible = (uid) ->
    svg = d3.select("#VIS");
    svg.selectAll(".user" + uid)
       .attr("visibility", (d) -> if userChecked(d.user) then "visible" else "hidden")


window.markUsers = markUsers
window.updateVisVisible = updateVisVisible
window.userChecked = userChecked