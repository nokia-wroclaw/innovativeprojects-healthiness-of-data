import numpy
import datetime
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from backend.Flask.app.utils import parse_check_date
from backend.Flask.app.utils import fetch_cluster_cords
import matplotlib.pyplot as plt
from collections import defaultdict
from scipy import signal
from scipy.signal import argrelmax
from toolbox.peakdetect import peakdetect


def autocorrelation(data):
    norm = (data - numpy.mean(data))
    result = numpy.correlate(norm, norm, mode='same')
    autocorr = result[len(data)//2 + 1:] / (numpy.var(data) * numpy.arange(len(data)-1, len(data)//2, -1))
    lag = numpy.abs(autocorr).argmax() + 1
    r = autocorr[lag-1]
    if numpy.abs(r) > 0.5:
        print("autocorrelated with r = %s and lag = %s" % (r, lag))
    else:
        print("%s %s" % (r, lag))
        print("not autocorrelated")
    return autocorr, lag


def get_operator_periodicity():
        fig = plt.figure()
        ax1 = fig.add_subplot(221)
        x = (numpy.sin(10*numpy.linspace(10*numpy.pi, 12*numpy.pi, 1000)).tolist()+(2*numpy.random.rand(1400)-1).tolist())
        print(len(x))
        autocor, lag = autocorrelation(x)
        # #print(autocor)
        # maxima = signal.argrelmax(autocor[acronym])
        # look_ahead = int(len(autocor[acronym])/len(maxima[0]))
        peaks = peakdetect(autocor, lookahead=lag)

        new_peaks = []
        for peak in peaks[0]:
            new_peaks.append(peak[0])
        peaks = new_peaks
        ax1.plot(autocor)
        ax1.set_title('Autocorrelation')
        ax1.plot(peaks, autocor[peaks], 'ro', markersize=2)

        ax2 = fig.add_subplot(222)
        ax2.plot(x)
        for peak in peaks:
            ax2.axvline(x=peak, color='r', linestyle='--', linewidth=1)
            ax2.axvline(x=peak + peaks[len(peaks)-1], color='r', linestyle='--', linewidth=1)
        # ax2.plot(values[acronym][peaks], 'ro')
        ax2.set_title('Kpi Values')

        plt.show()

get_operator_periodicity()