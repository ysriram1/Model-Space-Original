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


from ModelSpace import aggregateData as aggregateData1
visInput1 = aggregateData1(sampleFile1)

from ModelSpace_temp import aggregateData as aggregateData2
visInput2 = aggregateData2(sampleFile2)