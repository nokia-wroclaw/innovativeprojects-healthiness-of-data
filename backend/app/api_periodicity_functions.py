import numpy
import datetime
from cassandra.cqlengine import connection
from toolbox.cassandra_object_mapper_models import PlmnProcessedCord
from backend.app.utils import parse_check_date
import matplotlib.pyplot as plt
from collections import defaultdict
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


def get_operator_periodicity(start_date, end_date, kpi_basename, cord_id):
    start_date = parse_check_date(start_date)
    end_date = parse_check_date(end_date)

    if not start_date and not end_date:
        return False
    else:
        connection.setup(['127.0.0.1'], 'pb2')
        step = datetime.timedelta(days=1)
        acronyms = set()
        values = defaultdict(list)

        ready_data = {"cord_id": cord_id, "kpi_basename": kpi_basename, "values": []}
        while start_date < end_date:
            result = PlmnProcessedCord.objects.filter(cord_id=cord_id).filter(date=start_date)\
                                               .filter(kpi_basename=kpi_basename)
            start_date += step
            for row in result:
                acronyms.add(row.acronym)
                values[row.acronym].append(row.value)

        plt.close('all')
        autocor = {}
        #print(values)
        for acronym in acronyms:

            fig = plt.figure()
            ax1 = fig.add_subplot(221)
            autocor[acronym], lag = autocorrelation(values[acronym])
            # #print(autocor)
            # maxima = signal.argrelmax(autocor[acronym])
            # look_ahead = int(len(autocor[acronym])/len(maxima[0]))
            peaks = peakdetect(autocor[acronym], lookahead=lag)

            new_peaks = []
            for peak in peaks[0]:
                new_peaks.append(peak[0])
            peaks = new_peaks
            ax1.plot(autocor[acronym])
            ax1.set_title('Autocorrelation')
            ax1.plot(peaks, autocor[acronym][peaks], 'ro', markersize=2)

            ax2 = fig.add_subplot(222)
            ax2.plot(values[acronym])
            for peak in peaks:
                ax2.axvline(x=peak, color='r', linestyle='--', linewidth=1)
                ax2.axvline(x=peak+len(values[acronym])//2, color='r', linestyle='--', linewidth=1)
                #ax2.plot(peak, values[acronym][peak], 'ro', markersize=2)
            # ax2.plot(values[acronym][peaks], 'ro')
            ax2.set_title('Kpi Values')

        plt.show()