import ModelSpace
import sys
import cPickle # name changed
import collections

def loadPickleData(fname):
    AllData = cPickle.load(fname)
    VisData = ModelSpace.aggregateData(AllData)
    return (AllData, VisData)

def docsReadLists(VisData):
    res = collections.defaultdict(set)
    for userid in VisData.keys():
	for line in VisData[userid]['lines']:
	    toks = line['info'].split("<br />")[1][6:].split(", ")
	    res[userid].update(toks)
    return res


