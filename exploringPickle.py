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
