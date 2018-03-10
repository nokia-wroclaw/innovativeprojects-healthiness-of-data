from cassandra.cqlengine import columns
from cassandra.cqlengine.models import Model


class PlmnRaw(Model):
    kpi_basename = columns.Text(primary_key=True)
    date = columns.DateTime(primary_key=True)
    cord_id = columns.BigInt(primary_key=True)
    acronym = columns.Text(primary_key=True)
    kpi_name = columns.Text(primary_key=True)
    kpi_version = columns.Text()
    value = columns.Double()


class PlmnProcessed(Model):
    kpi_basename = columns.Text(primary_key=True)
    date = columns.DateTime(primary_key=True)
    cord_id = columns.BigInt(primary_key=True)
    acronym = columns.Text(primary_key=True)
    kpi_name = columns.Text(primary_key=True)
    kpi_version = columns.Text()
    value = columns.Double()


class PlmnBadEntries(Model):
    kpi_basename = columns.Text(primary_key=True)
    date = columns.DateTime(primary_key=True)
    cord_id = columns.BigInt(primary_key=True)
    acronym = columns.Text(primary_key=True)
    kpi_name = columns.Text(primary_key=True)
    kpi_version = columns.Text()
    value = columns.Double()


class PlmnKeyNotFound(Model):
    kpi_basename = columns.Text(primary_key=True)
    date = columns.DateTime(primary_key=True)
    cord_id = columns.BigInt(primary_key=True)
    acronym = columns.Text(primary_key=True)
    kpi_name = columns.Text(primary_key=True)
    kpi_version = columns.Text()
    value = columns.Double()


class PlmnRawCord(Model):
    cord_id = columns.BigInt(primary_key=True)
    date = columns.DateTime(primary_key=True)
    kpi_basename = columns.Text(primary_key=True)
    acronym = columns.Text(primary_key=True)
    kpi_name = columns.Text(primary_key=True)
    kpi_version = columns.Text()
    value = columns.Double()


class KpiUnits(Model):
    kpi_basename = columns.Text(primary_key=True)
    kpi_name = columns.Text(primary_key=True)
    max = columns.Double()
    min = columns.Double()
    unit = columns.Text()


class MissingKpis(Model):
    kpi_basename = columns.Text(primary_key=True)
    kpi_name = columns.Text(primary_key=True)
    kpi_version = columns.Text()