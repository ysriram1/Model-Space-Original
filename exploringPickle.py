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

DFLen = 215 #number of values in each vector

fullDFDict = {}
uidOrdLst=[]

for uid, userData in sampleFile1.items():
    fullDFDict[uid] = ([x[2] for x in userData["logs"] if x[1] == 'DF'])
    uidOrdLst.append(uid)
    
for uid in fullDFDict.keys():
    fullDFDict[uid].insert(0,[1./DFLen]*DFLen)

#Creating a numpy array:
dfLst = []
for userData in fullDFDict.values():
    for vector in userData:
        dfLst.append(vector)

vectorMat = np.array(dfLst)


vecToOrigIdx = defaultdict(list)
for i in range(len(vectorMat)):
    vecToOrigIdx[tuple(vectorMat[i])].append(i)
vecKeyList = list(vecToOrigIdx.keys())
vecsForMDS = np.array([ list(x) for x in vecKeyList ])

# add extra stuff to be part of the projection but ignored later
#Adding noise
np.random.seed(199)
vecsForMDSNoise = np.array([[np.random.normal(np.mean(x),np.std(x)) for x in vecsForMDS.T] for y in range(100)])
vecsForMDSTotal = np.concatenate((vecsForMDS, vecsForMDSNoise), axis =0)

# get the projected vectors for the unique subset of vectors
from sklearn.manifold import MDS
subsetRedVectorMat = MDS(n_components=2, random_state=99,dissimilarity='euclidean').fit_transform(vecsForMDSTotal)

#from sklearn.decomposition import PCA
#subsetRedVectorMat = PCA(n_components=2).fit_transform(vecsForMDSTotal)

# put back the projected vectors back in the reduced matrix
redVectorMat = np.zeros([len(vectorMat), 2])
for iKey, vecKey in enumerate(vecKeyList): # iterate through list of tuple keys
    for targetIdx in vecToOrigIdx[vecKey]: # for all rows where this projected point belongs
        redVectorMat[targetIdx] = subsetRedVectorMat[iKey]


redMatDict =  {}
start = 0; end = 0
count_check = 0 #should equal original length
for userKey in uidOrdLst:
    end = end + len(fullDFDict[userKey])
    redMatDict[userKey] = redVectorMat[start:end]
    count_check += end - start
    start = end

#######Plotting just to check###########
import matplotlib.pyplot as plt
from matplotlib.pyplot import cm 
plt.style.use('ggplot')

#colorPerUser = { 1:1,5:1,6:1,8:1,9:1,10:2,2:3,4:3,7:3,11:3} 
#colorGroupToColor = { 1: 'b', 2: 'g', 3: 'r'}
#colorGroupToColor[colorPerUser[int(logID)]] #use for groups
colors=cm.rainbow(np.linspace(0,1,10))

fig = plt.figure(figsize=(17,17))
ax = fig.add_subplot(111)

for color, logID in zip(colors,redMatDict.keys()):
    name = 'User' + str(logID)
    MDSVals = redMatDict[logID]
    ax.scatter(MDSVals[:,0], MDSVals[:,1], color = 'b', s=40)
    ax.plot(MDSVals[:,0], MDSVals[:,1], '-', color = color, label = name, linewidth=4)


ax.legend()
plt.xlabel('MDS Proj 1'); plt.ylabel('MDS Proj 2')
plt.title('MDS Solution Vectors for Diffirent Users of DocFunction')
plt.legend(prop={'size':20}, bbox_to_anchor=(1,1))
plt.tight_layout(pad=7)
plt.savefig('./MDSOutput_wNoise_all.png')
#################################################################

##########Adding these results back to the pickle file
import copy

replacePickle = copy.deepcopy(sampleFile1)

for uid in sampleFile1.keys():
    replacePickle[uid]["initLayoutPoint"] = tuple(redMatDict[uid][0])
    replacePickle[uid]['layouts'] = [tuple(redMatDict[uid][x]) for x in range(1,len(redMatDict[uid]))]

import pickle

pFile = open('./docModelwNoise.pickle', 'w')
pickle.dump(replacePickle, pFile)
pFile.close()

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
