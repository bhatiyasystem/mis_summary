import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font, Svg, Path, Circle } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f8fafc',
    fontFamily: 'Helvetica',
    paddingBottom: 60,
  },
  headerContainer: {
    backgroundColor: '#0a2e65',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
    position: 'relative',
    marginBottom: 20,
  },
  innerHeaderBox: {
    borderWidth: 1,
    borderColor: '#4267b2',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c387a',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerRightText1: {
    color: '#a0bdf2',
    fontSize: 8,
    marginBottom: 4,
  },
  headerRightText2: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateBox: {
    position: 'absolute',
    bottom: -15,
    left: 30,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '60%',
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  dateText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a2e65',
  },
  body: {
    paddingHorizontal: 30,
  },
  moduleNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a2e65',
    marginBottom: 10,
    marginTop: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 5,
  },
  cardItem: {
    width: '31%',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIconBoxCompleted: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  cardIconBoxInProgress: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  cardIconBoxNotStarted: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  cardViewAllWrap: { display: 'none' },
  cardViewAllText: { display: 'none' },
  
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardCountText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginRight: 4 },
  cardLabelTextCompleted: { fontSize: 8, fontWeight: 'bold', color: '#16a34a' },
  cardLabelTextInProgress: { fontSize: 8, fontWeight: 'bold', color: '#d97706' },
  cardLabelTextNotStarted: { fontSize: 8, fontWeight: 'bold', color: '#dc2626' },
  cardSubDesc: { display: 'none' },
  
  cardBottomBarBase: { display: 'none' },
  cardBottomBarFillCompleted: { display: 'none' },
  cardBottomBarFillInProgress: { display: 'none' },
  cardBottomBarFillNotStarted: { display: 'none' },

  activityContainer: { display: 'none' },
  activityBox: { display: 'none' },
  activityText: { display: 'none' },
  activityValue: { display: 'none' },
  
  tableHeaderWrap: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#0a2e65', paddingBottom: 6, marginBottom: 10 },
  tableHeaderTitle: { fontSize: 10, fontWeight: 'bold', color: '#0a2e65' },
  tableSubTitle: { fontSize: 8, color: '#64748b' },
  table: { width: '100%', backgroundColor: '#ffffff', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  tableRowHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  
  col1: { width: '10%', paddingHorizontal: 4 }, // Stage
  col2: { width: '12%', paddingHorizontal: 4 }, // Person
  col3: { width: '22%', paddingHorizontal: 4 }, // Task
  col4: { width: '10%', paddingHorizontal: 4 }, // Actual
  col5: { width: '10%', paddingHorizontal: 4 }, // Delay
  col6: { width: '10%', paddingHorizontal: 4 }, // Progress
  col7: { width: '14%', paddingHorizontal: 4 }, // Status
  col8: { width: '12%', paddingHorizontal: 4 }, // Timeline
  
  colTextHeader: { fontSize: 8, fontWeight: 'bold', color: '#475569' },
  colText: { fontSize: 8, color: '#1e293b' },
  colTextSuccess: { fontSize: 8, color: '#16a34a', fontWeight: 'bold' },
  colTextWarning: { fontSize: 8, color: '#d97706', fontWeight: 'bold' },
  colTextNeutral: { fontSize: 8, color: '#475569', fontWeight: 'bold' },
  emptyText: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 20 },
  
  badge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#2563eb',
    fontSize: 6,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  moduleSubtitle: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    flex: 1,
    marginLeft: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: { fontSize: 8, color: '#94a3b8' },
});

const AllModulesPDF = ({ modules = [], allData = {}, logoPath }) => {
  const today = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const padZero = (num) => String(num || 0).padStart(2, '0');

  const parseDDMMYYYY = (str) => {
    if (!str) return null;
    const s = String(str).trim();
    if (!s.includes('/') && !s.includes('-')) return null;
    const parts = s.split('/');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      if (!isNaN(d.getTime())) return d;
    }
    const fallback = new Date(s);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const getISTDateWithoutTime = (d) => {
    if (!d) return null;
    const copy = new Date(d.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const todayDate = getISTDateWithoutTime(new Date());

  const getTaskDate = (dateStr) => {
    const parsed = parseDDMMYYYY(dateStr);
    return getISTDateWithoutTime(parsed);
  };

  let totalCompleted = 0;
  let totalCurrentPending = 0;
  let totalPastPending = 0;

  modules.forEach((mod) => {
    const reports = allData[mod.id] || [];
    reports.forEach((r) => {
      const pDate = getTaskDate(r.planned);
      const aDate = getTaskDate(r.actual);
      
      const isCompletedToday = aDate && todayDate && aDate.getTime() === todayDate.getTime();
      const isCurrentPending = !aDate && pDate && todayDate && pDate.getTime() === todayDate.getTime();
      const isPastPending = !aDate && pDate && todayDate && pDate.getTime() < todayDate.getTime();

      if (isCompletedToday) {
        totalCompleted++;
      } else if (isCurrentPending) {
        totalCurrentPending++;
      } else if (isPastPending) {
        totalPastPending++;
      }
    });
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer} fixed>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>Executive Overview - {today}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>All-Module Summary</Text>
          </View>
          <Text style={styles.moduleNameText}>Project Report Summary</Text>
          <Text style={styles.moduleSubtitle}>Aggregated task status across all operations and departments</Text>
          
          <Text style={styles.sectionTitle}>Global Portfolio Status</Text>
          <View style={styles.cardsContainer}>
            <View style={styles.cardItem}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardIconBoxCompleted}>
                  <Svg viewBox="0 0 24 24" width={10} height={10}>
                    <Circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth={2} fill="none" />
                    <Path d="M 8 12 L 11 15 L 16 10" stroke="#16a34a" strokeWidth={2} fill="none" />
                  </Svg>
                </View>
                <Text style={styles.cardLabelTextCompleted}>COMPLETED</Text>
              </View>
              <View style={styles.cardMiddleRow}>
                <Text style={styles.cardCountText}>{padZero(totalCompleted)}</Text>
              </View>
            </View>

            <View style={styles.cardItem}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardIconBoxInProgress}>
                  <Svg viewBox="0 0 24 24" width={10} height={10}>
                    <Circle cx="12" cy="12" r="9" stroke="#d97706" strokeWidth={2} fill="none" />
                    <Path d="M 12 7 L 12 12 L 15 14" stroke="#d97706" strokeWidth={2} fill="none" />
                  </Svg>
                </View>
                <Text style={styles.cardLabelTextInProgress}>CURRENT PENDING</Text>
              </View>
              <View style={styles.cardMiddleRow}>
                <Text style={styles.cardCountText}>{padZero(totalCurrentPending)}</Text>
              </View>
            </View>

            <View style={styles.cardItem}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardIconBoxNotStarted}>
                  <Svg viewBox="0 0 24 24" width={10} height={10}>
                    <Circle cx="12" cy="12" r="9" stroke="#dc2626" strokeWidth={2} fill="none" />
                    <Path d="M 12 9 L 12 15 M 9 12 L 15 12" stroke="#dc2626" strokeWidth={2} fill="none" />
                  </Svg>
                </View>
                <Text style={styles.cardLabelTextNotStarted}>TOTAL PENDING</Text>
              </View>
              <View style={styles.cardMiddleRow}>
                <Text style={styles.cardCountText}>{padZero(totalCurrentPending + totalPastPending)}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Breakdown by Module</Text>
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.col3, styles.colTextHeader, { width: '35%' }]}>Module Name</Text>
              <Text style={[styles.col4, styles.colTextHeader, { width: '15%' }]}>Tasks</Text>
              <Text style={[styles.col5, styles.colTextHeader, { width: '15%' }]}>Completed</Text>
              <Text style={[styles.col4, styles.colTextHeader, { width: '20%' }]}>Total Pending</Text>
              <Text style={[styles.col6, styles.colTextHeader, { width: '15%' }]}>Status</Text>
            </View>
            {modules.map((mod) => {
              const modReports = allData[mod.id] || [];
              const todayReports = modReports.filter(r => {
                const pDate = getTaskDate(r.planned);
                const aDate = getTaskDate(r.actual);
                const isPlannedToday = pDate && todayDate && pDate.getTime() === todayDate.getTime();
                const isCompletedToday = aDate && todayDate && aDate.getTime() === todayDate.getTime();
                return isPlannedToday || isCompletedToday;
              });
              const modCompleted = todayReports.filter(r => {
                const aDate = getTaskDate(r.actual);
                return aDate && todayDate && aDate.getTime() === todayDate.getTime();
              }).length;

              const modTotalPending = modReports.filter(r => {
                const pDate = getTaskDate(r.planned);
                const aDate = getTaskDate(r.actual);
                const isCurrentPending = !aDate && pDate && todayDate && pDate.getTime() === todayDate.getTime();
                const isPastPending = !aDate && pDate && todayDate && pDate.getTime() < todayDate.getTime();
                return isCurrentPending || isPastPending;
              }).length;

              const progress = todayReports.length > 0 ? Math.round((modCompleted / todayReports.length) * 100) : 0;
              return (
                <View key={mod.id} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.col3, styles.colText, { width: '35%' }]}>{String(mod.name)}</Text>
                  <Text style={[styles.col4, styles.colText, { width: '15%' }]}>{todayReports.length}</Text>
                  <Text style={[styles.col5, styles.colText, { width: '15%' }]}>{modCompleted}</Text>
                  <Text style={[styles.col4, styles.colText, { width: '20%' }]}>{modTotalPending}</Text>
                  <Text style={[styles.col6, styles.colText, { width: '15%', color: progress === 100 ? '#16a34a' : '#2563eb' }]}>{progress}% Done</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Powered by Botivate</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} />
        </View>
      </Page>
      {modules.map((module) => {
        const reports = allData[module.id] || [];
        
        // Filter to only today's tasks for the table and completed/current pending cards
        const todayReports = reports.filter(r => {
          const pDate = getTaskDate(r.planned);
          const aDate = getTaskDate(r.actual);
          const isPlannedToday = pDate && todayDate && pDate.getTime() === todayDate.getTime();
          const isCompletedToday = aDate && todayDate && aDate.getTime() === todayDate.getTime();
          return isPlannedToday || isCompletedToday;
        });

        const completedCount = todayReports.filter(r => {
          const aDate = getTaskDate(r.actual);
          return aDate && todayDate && aDate.getTime() === todayDate.getTime();
        }).length;

        const currentPendingCount = todayReports.filter(r => {
          const pDate = getTaskDate(r.planned);
          const aDate = getTaskDate(r.actual);
          return !aDate && pDate && todayDate && pDate.getTime() === todayDate.getTime();
        }).length;
        
        // Past pending should search across all loaded tasks
        const pastPendingCount = reports.filter(r => {
          const pDate = getTaskDate(r.planned);
          const aDate = getTaskDate(r.actual);
          return !aDate && pDate && todayDate && pDate.getTime() < todayDate.getTime();
        }).length;

        return (
          <Page key={module.id} size="A4" style={styles.page}>
            <View style={styles.headerContainer} fixed>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>Daily Report - {today}</Text>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.headerRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Module: {String(module.id).replace(/-/g, ' ')}</Text>
                </View>
                <View style={styles.divider} />
              </View>
              <Text style={styles.moduleNameText}>{String(module.name)}</Text>
              <Text style={styles.moduleSubtitle}>Monitoring live operations and work reports for the current cycle</Text>
              
              <Text style={styles.sectionTitle}>Tasks Summary</Text>
              
              <View style={styles.cardsContainer}>
                <View style={styles.cardItem}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardIconBoxCompleted}>
                      <Svg viewBox="0 0 24 24" width={10} height={10}>
                        <Circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth={2} fill="none" />
                        <Path d="M 8 12 L 11 15 L 16 10" stroke="#16a34a" strokeWidth={2} fill="none" />
                      </Svg>
                    </View>
                    <Text style={styles.cardLabelTextCompleted}>COMPLETED</Text>
                  </View>
                  <View style={styles.cardMiddleRow}>
                    <Text style={styles.cardCountText}>{padZero(completedCount)}</Text>
                  </View>
                </View>

                <View style={styles.cardItem}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardIconBoxInProgress}>
                      <Svg viewBox="0 0 24 24" width={10} height={10}>
                        <Circle cx="12" cy="12" r="9" stroke="#d97706" strokeWidth={2} fill="none" />
                        <Path d="M 12 7 L 12 12 L 15 14" stroke="#d97706" strokeWidth={2} fill="none" />
                      </Svg>
                    </View>
                    <Text style={styles.cardLabelTextInProgress}>CURRENT PENDING</Text>
                  </View>
                  <View style={styles.cardMiddleRow}>
                    <Text style={styles.cardCountText}>{padZero(currentPendingCount)}</Text>
                  </View>
                </View>

                <View style={styles.cardItem}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardIconBoxNotStarted}>
                      <Svg viewBox="0 0 24 24" width={10} height={10}>
                        <Circle cx="12" cy="12" r="9" stroke="#dc2626" strokeWidth={2} fill="none" />
                        <Path d="M 12 9 L 12 15 M 9 12 L 15 12" stroke="#dc2626" strokeWidth={2} fill="none" />
                      </Svg>
                    </View>
                    <Text style={styles.cardLabelTextNotStarted}>TOTAL PENDING</Text>
                  </View>
                  <View style={styles.cardMiddleRow}>
                    <Text style={styles.cardCountText}>{padZero(currentPendingCount + pastPendingCount)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tableHeaderWrap}>
                <Text style={styles.tableHeaderTitle}>Task Updates: {today}</Text>
                <Text style={styles.tableSubTitle}>Category: {String(module.name)}</Text>
              </View>

              {(() => {
                const showTaskDesc = String(module.name || '').trim().toLowerCase() === 'checklist & delegation';
                return (
                  <View style={styles.table}>
                    <View style={styles.tableRowHeader}>
                      <Text style={[styles.col1, styles.colTextHeader, !showTaskDesc && { width: '15%' }]}>Stage</Text>
                      <Text style={[styles.col2, styles.colTextHeader, !showTaskDesc && { width: '20%' }]}>Person</Text>
                      {showTaskDesc && <Text style={[styles.col3, styles.colTextHeader]}>Task Description</Text>}
                      <Text style={[styles.col4, styles.colTextHeader, !showTaskDesc && { width: '10%' }]}>Actual</Text>
                      <Text style={[styles.col5, styles.colTextHeader, !showTaskDesc && { width: '10%' }]}>Delay</Text>
                      <Text style={[styles.col6, styles.colTextHeader, !showTaskDesc && { width: '10%' }]}>Comp%</Text>
                      <Text style={[styles.col7, styles.colTextHeader, !showTaskDesc && { width: '19%' }]}>Status</Text>
                      <Text style={[styles.col8, styles.colTextHeader, !showTaskDesc && { width: '16%' }]}>Timeline</Text>
                    </View>

                    {todayReports.length > 0 ? todayReports.map((report, idx) => (
                      <View key={idx} style={styles.tableRow} wrap={false}>
                        <Text style={[styles.col1, styles.colText, !showTaskDesc && { width: '15%' }]}>{String(report.projectName || '-')}</Text>
                        <Text style={[styles.col2, styles.colText, !showTaskDesc && { width: '20%' }]}>{String(report.personName || '-')}</Text>
                        {showTaskDesc && <Text style={[styles.col3, styles.colText]}>{String(report.taskDescription || '-')}</Text>}
                        <Text style={[styles.col4, styles.colText, !showTaskDesc && { width: '10%' }]}>{String(report.actual || '-')}</Text>
                        <Text style={[styles.col5, styles.colText, !showTaskDesc && { width: '10%' }]}>{String(report.delay || '-')}</Text>
                        <Text style={[styles.col6, styles.colText, !showTaskDesc && { width: '10%' }]}>{String(report.progress || 0)}%</Text>
                        <Text style={[
                          styles.col7, 
                          !showTaskDesc && { width: '19%' },
                          report.status === 'Completed' ? styles.colTextSuccess : 
                          report.status === 'In Progress' ? styles.colTextWarning : 
                          styles.colTextNeutral
                        ]}>
                          {String(report.status)}
                        </Text>
                        <Text style={[styles.col8, styles.colText, !showTaskDesc && { width: '16%' }]}>{String(report.date || today)}</Text>
                      </View>
                    )) : (
                      <Text style={styles.emptyText}>No tasks found for this module today.</Text>
                    )}
                  </View>
                );
              })()}
            </View>
            <View style={styles.footer} fixed>
              <Text style={styles.footerText}>Powered by Botivate</Text>
              <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default AllModulesPDF;
