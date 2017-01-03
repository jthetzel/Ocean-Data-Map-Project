from abc import ABCMeta, abstractmethod
from StringIO import StringIO
import matplotlib.pyplot as plt
import datetime
import numpy as np
import utils
import colormap
import re
import pint
from oceannavigator.util import get_variable_unit, get_variable_name


class Plotter:
    __metaclass__ = ABCMeta

    def __init__(self, dataset_name, query, format):
        self.dataset_name = dataset_name
        self.query = query
        self.format = format
        self.dpi = 72.
        self.size = '11x9'
        self.filetype, self.mime = utils.get_mimetype(format)
        self.filename = utils.get_filename(
            self.plottype,
            dataset_name,
            self.filetype
        )

    def run(self, **kwargs):
        if 'size' in kwargs and kwargs.get('size') is not None:
            self.size = kwargs.get('size')

        if 'dpi' in kwargs and kwargs.get('dpi') is not None:
            self.dpi = float(kwargs.get('dpi'))

        self.parse_query(self.query)
        self.load_data()

        if self.filetype == 'csv':
            return self.csv()
        elif self.filetype == 'txt':
            return self.odv_ascii()
        else:
            return self.plot()

    @abstractmethod
    def parse_query(self, query):
        quantum = query.get('dataset_quantum')
        if quantum == 'month':
            self.dformat = "%B %Y"
        elif quantum == 'day':
            self.dformat = "%d %B %Y"
        elif quantum == 'hour':
            self.dformat = "%H:%M %d %B %Y"
        else:
            self.dformat = "%d %B %Y"

        def get_time(param):
            if query.get(param) is None or len(str(query.get(param))) == 0:
                return -1
            else:
                try:
                    return int(query.get(param))
                except ValueError:
                    return query.get(param)

        self.time = get_time('time')
        self.starttime = get_time('starttime')
        self.endtime = get_time('endtime')

        scale = query.get('scale')
        if scale is None or 'auto' in scale:
            scale = None
        else:
            scale = [float(x) for x in scale.split(',')]
        self.scale = scale

        variables = query.get('variable')
        if variables is None:
            variables = ['votemper']

        if isinstance(variables, str) or isinstance(variables, unicode):
            variables = variables.split(',')

        self.variables_anom = variables
        self.variables = [re.sub('_anom$', '', v) for v in variables]

        cmap = query.get('colormap')
        if cmap is not None:
            cmap = colormap.colormaps.get(cmap)
        if cmap is None and self.variables != self.variables_anom:
            cmap = colormap.colormaps['anomaly']
        self.cmap = cmap

        linearthresh = query.get('linearthresh')
        if linearthresh is None or linearthresh == '':
            linearthresh = 200
        linearthresh = float(linearthresh)
        if not linearthresh > 0:
            linearthresh = 1
        self.linearthresh = linearthresh

        depth = query.get('depth')
        if depth is None or len(str(depth)) == 0:
            depth = 0

        self.depth = depth

        self.showmap = query.get('showmap') is None or \
            bool(query.get('showmap'))

    @abstractmethod
    def load_data(self):
        pass

    def load_misc(self, dataset, variables):
        self.variable_names = self.get_variable_names(dataset, variables)
        self.variable_units = self.get_variable_units(dataset, variables)

        depth_var = utils.get_depth_var(dataset)
        self.depths = depth_var[:]
        self.depth_unit = depth_var.units

    def plot(self, fig=None):
        if fig is None:
            fig = plt.gcf()

        buf = StringIO()
        try:
            plt.savefig(
                buf,
                format=self.filetype,
                dpi='figure',
                bbox_inches='tight',
                pad_inches=0.5,
            )
            plt.close(fig)
            return (buf.getvalue(), self.mime, self.filename)
        finally:
            buf.close()

    def csv(self, header=[], columns=[], data=[]):
        buf = StringIO()
        try:
            buf.write("\n".join(
                map(lambda h: "// %s: %s" % (h[0], h[1]), header)
            ))
            buf.write("\n")
            buf.write(", ".join(columns))
            buf.write("\n")

            for l in data:
                buf.write(", ".join(map(str, l)))
                buf.write("\n")

            return (buf.getvalue(), self.mime, self.filename)
        finally:
            buf.close()

    def odv_ascii(self, cruise="", variables=[], variable_units=[],
                  station=[], latitude=[], longitude=[], depth=[], time=[],
                  data=[]):
        buf = StringIO()
        try:
            buf.write("//<CreateTime>%s</CreateTime>\n" % (
                datetime.datetime.now().isoformat()
            ))
            buf.write("//<Software>Ocean Navigator</Software>\n")
            buf.write("\t".join([
                "Cruise",
                "Station",
                "Type",
                "yyyy-mm-ddThh:mm:ss.sss",
                "Longitude [degrees_east]",
                "Latitude [degrees_north]",
                "Depth [m]",
            ] + map(lambda x: "%s [%s]" % x, zip(variables, variable_units))))
            buf.write("\n")

            for idx in range(0, len(station)):
                if idx > 0:
                    cruise = ""

                if isinstance(data[idx], np.ma.MaskedArray) and \
                        data[idx].mask.all():
                    continue

                line = [
                    cruise,
                    station[idx],
                    "C",
                    time[idx].isoformat(),
                    "%0.4f" % longitude[idx],
                    "%0.4f" % latitude[idx],
                    "%0.1f" % depth[idx],
                ] + map(str, data[idx])

                if idx > 0 and station[idx] == station[idx - 1]:
                    line[1] = ""
                    line[2] = ""
                    line[3] = ""
                    line[4] = ""
                    line[5] = ""

                buf.write("\t".join(line))
                buf.write("\n")

            return (buf.getvalue(), self.mime, self.filename)
        finally:
            buf.close()

    def get_variable_names(self, dataset, variables):
        names = []

        for idx, v in enumerate(variables):
            names.append(get_variable_name(self.dataset_name,
                                           dataset.variables[v]))
            if self.variables_anom[idx] != self.variables[idx]:
                names[idx] = names[idx] + " Anomaly"

        return names

    def get_variable_units(self, dataset, variables):
        units = []

        for idx, v in enumerate(variables):
            units.append(get_variable_unit(self.dataset_name,
                                           dataset.variables[v]))

        return units

    def clip_value(self, input_value, variable):
        output = input_value

        if output >= variable.shape[0]:
            output = variable.shape[0] - 1

        if output < 0:
            output = 0

        return output

    def fix_startend_times(self, dataset):
        time_var = utils.get_time_var(dataset)
        self.starttime = self.clip_value(self.starttime, time_var)
        self.endtime = self.clip_value(self.endtime, time_var)

        if self.starttime > self.endtime:
            self.starttime = self.endtime - 1
            if self.starttime < 0:
                self.starttime = 0
                self.endtime = 2

    def plot_legend(self, figure, labels):
        if len(labels) > 10:
            legend = plt.legend(labels, loc='upper right',
                                bbox_to_anchor=(1, 0, 0.25, 1),
                                borderaxespad=0.,
                                bbox_transform=figure.transFigure,
                                ncol=np.ceil(self.data.shape[0] /
                                             30.0).astype(int))
        elif len(labels) > 1:
            legend = plt.legend(labels, loc='best')
        else:
            legend = None

        if legend:
            for legobj in legend.legendHandles:
                legobj.set_linewidth(4.0)

    def vector_name(self, name):
        n = re.sub(
            r"(?i)( x | y |zonal |meridional |northward |eastward )",
            " ",
            name
        )
        return re.sub(r" +", " ", n)

    def kelvin_to_celsius(self, unit, data):
        ureg = pint.UnitRegistry()
        try:
            u = ureg.parse_units(unit.lower())
        except pint.UndefinedUnitError:
            u = ureg.dimensionless

        if u == ureg.kelvin:
            unit = "Celsius"
            data = ureg.Quantity(data, u).to(ureg.celsius).magnitude

        return (unit, data)