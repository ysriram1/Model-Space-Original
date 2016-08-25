from bottle import route, post, run, static_file, template, request

import ModelSpace
import sys
import pickle as cPickle # name changed

if len(sys.argv) != 2:
    print('Please specify an input pickle file; { uid: user_pickle }')
    sys.exit(1)

AllData = cPickle.load(open(sys.argv[1]))
UserData = ModelSpace.aggregateData(AllData)

@route('/ModelSpace')
def ModelSpace():
    return static_file('ModelSpace.html', root='.')

@post('/ModelSpace/data')
def giveData():
    return {'userdata': UserData}
    
@route('/ModelSpace/js/<fname:re:[a-zA-z0-9\-\.]+\.js>')
def send_js(fname):
    return static_file(fname, root='./js/', mimetype='application/javascript')

@route('/ModelSpace/css/<fname:re:[a-zA-z0-9\-\.]+\.css>')
def send_css(fname):
    return static_file(fname, root='./css/')

@route('/ModelSpace/svg/<fname:re:[a-zA-z0-9\-\.]+\.svg>')
def send_css(fname):
    return static_file(fname, root='./svg/')

run(host='127.0.0.1', port=11300, debug=True, reloader=True)
