# -*- coding: utf-8 -*-
"""
Created on Mon Aug  8 00:38:27 2016

@author: Sriram
"""

####this script recreates the aggregate functions output using our data


#userData = sampleFile2[1] #Just to test out

def fillDFs(userData):
    knnAcc = userData['KNNAcc'][0]
    startTuple = [(0, userData['initLayoutPoint'], 'Starting... <br /> 5-NN Accuracy: %.2f'%knnAcc,knnAcc)]
    remainingTuples = []
    for i, points in enumerate(userData['layouts']):
        if userData['undoIndicator'][i] == 1: continue
        featureString = '<u>Top 5 Features</u>: <br> '
        for featureName in userData['topFeatures'][i+1]: #first list is for initial point so we skip that
            featureString = featureString + featureName + '<br> '
        text = 'DF Number: %i <br> 5-NN Accuracy: %.2f <br><br> %s'%(i+2, userData['KNNAcc'][i+1], featureString)
        knnAcc = userData['KNNAcc'][i+1]
        remainingTuples.append(((i+1)*5,points,text,knnAcc))
    return startTuple + remainingTuples
    

def fillLines(userData):
    linesLst = []
    pushj = 0
    for i, points in enumerate(userData['layouts']):
        pointsMovedCount = 0
        pointsMovedCountText = ''
        j = i + 1 #the pointsList starts with key 1 not 0
        pointsText = '<br><u>Points Moved</u>: <br> '        
        print j - pushj
        if userData['undoIndicator'][i] == 1: pointAddText = 'None(user used UNDO)'; pushj += 1; print pushj
        else: 
            pointsMovedFullLst = userData['pointsMoved'][j-pushj] #need to go back by pushj amount since pointsMoved dict doesnt take into account undos            
            allEntryLst = []            
            for entry in pointsMovedFullLst:
                subEntryLst = []
                for subEntry in entry:
                    subEntryLst.append(subEntry.split(',')[0])#only the first point of the list is the point ID (the other vals are the pixels)
                allEntryLst.append(subEntryLst)
            
            setVals = {}
            for index, pointSet in enumerate(allEntryLst):#This is done to ensure the sets are divided properly (each line with only have 6 items)
                setVals[index] = '<u>Set%s</u> <br>'%(index+1)                
                #setVals[index] = '<u>Set%s</u> <br> <b>Number Moved:</b> %s <br>'%(index+1, len(allEntryLst[index]))
                start=0; end = 0
                for cut in range(len(pointSet)//6):
                    start = end
                    end = end + 6
                    setVals[index] += ', '.join(pointSet[start:end]) + '<br>'
                if len(pointSet)%6 != 0: setVals[index] += ', '.join(pointSet[end:end+len(pointSet)%6]) + '<br>'
            set1 = setVals[0]
            set2 = setVals[1]
            #set1 = '<u>Set 1</u>: ' + ','.join(allEntryLst[0]) + '<br \>'
            #set2 = '<u>Set 2</u>: ' + ','.join(allEntryLst[1])
            pointsMovedCount = sum([len(allEntryLst[index]) for index in range(len(allEntryLst))])
            pointsMovedCountText ='(Total ' + str(pointsMovedCount) + ' points moved)<br>'#Counting the total number of points moved            
            pointAddText = set1 + set2
        totalPointsText = pointsText + pointsMovedCountText + pointAddText
        text = "<u>Accuracy Change</u>: "
        if i == 0: 
            x1 = userData['initLayoutPoint'][0]
            y1 = userData['initLayoutPoint'][1]
        else:
            x1 = userData['layouts'][i-1][0]
            y1 = userData['layouts'][i-1][1]
        x2 = userData['layouts'][i][0]
        y2 = userData['layouts'][i][1]
        accChange = userData['KNNAcc'][i] - userData['KNNAcc'][i-1]
        direction = "increase" if round(accChange,2) >0  else "decrease"
        if round(accChange,2) == 0: direction = "unchanged"
        if round(accChange,2) == 0: accChange = 0
        if accChange>0: text = text + "+%.2f (%s)"%(accChange,direction)        
        else: text = text + "%.2f (%s)"%(accChange,direction)
        undoInd = False
        if userData['undoIndicator'][i] == 1: undoInd = True
        linesLst.append({'backward': undoInd, 'info':text + totalPointsText, 
        'x1':x1,'x2':x2,'y1':y1,'y2':y2, 'count':pointsMovedCount})
    return linesLst
    
def DFLinesDict(userData):
    return {'DFs':fillDFs(userData), 'lines':fillLines(userData)}