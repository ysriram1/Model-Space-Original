# -*- coding: utf-8 -*-
"""
Created on Tue Aug 23 13:23:00 2016

@author: SYARLAG1
"""

import pickle
import os
import pandas as pd
import numpy as np

os.chdir('C:/Users/SYARLAG1/Desktop/Model-Space-Original')

sampleFile1 = pickle.load(open('no15812_newproj.pickle'))
sampleFile2 = pickle.load(open('userDisfunctionSpace.pickle'))

# bring all the sources together
# input is of the format:
# { uid: {'layouts' -> [ (x,y) ],
#         'terms' -> [ term ],
#         'logs' -> [ (log tuple) ], *(dt, marker, [info])
#         'observations' -> { 'comments': [ comments at end ],
#                             'gender': 'f' or 'm',
#                             'job': str,
#                             'insight_names': [str]
#                             'starttime': dt
#                             'insights': [ { 'insights': { isightname: num },
#                                             'notes': str,
#                                             'time': dt } ]
#                           }
#        }
# }
# extract the distance functions per user


#####Creating MDS projections after adding noise from the original pickle file###################
from collections import defaultdict

fullDFDict = defaultdict(list)

for uid, userData in sampleFile1.items():
    DFs = [ x[2] for x in userData["logs"] if x[1] == 'DF']
    fullDFDict[uid].append(DFs)

keyList = list(fullDFDict.keys())

#Creating a numpy array:
for userData in fullDFDict.values():
    for 

dfMat = np.array(fullDFDict.values())

#sampleFile1[uid]["initLayoutPoint"] = _first off hte pile
# count = 1
# for uid, uiserData in sampleFiles1.items():
#     numLayouts = len(userData["layouts"])
#     userData["layouts"] = []
#     for i in range(numLayouts):
#         userData["layouts"].append = resultlist [count ]
#         count ++
###########

from ModelSpace import aggregateData as aggregateData1
visInput1 = aggregateData1(sampleFile1)

from ModelSpace_temp import aggregateData as aggregateData2
visInput2 = aggregateData2(sampleFile2)

maxCount = 0 
for key in visInput1.keys():
    for lstElem in visInput1[key]['lines']:
        if lstElem['interactionCount'] > maxCount:
            maxCount = lstElem['interactionCount']
            
print maxCount #68 for read
print maxCount #20 for search
print maxCount #21 for interaction
