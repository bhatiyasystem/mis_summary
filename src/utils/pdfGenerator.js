import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

export const generateDashboardPDF = async (visibleColumnsList, filteredEmployeesData, topBestPerformers = [], pendingTasks = [], topWorstPerformers = [], departmentScores = []) => {
  const today = new Date().toLocaleDateString();

  // Create a temporary container for the report
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '1000px'; // Adjusted width for better PDF fit
  container.style.backgroundColor = 'white';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.zIndex = '-9999';
  container.style.visibility = 'visible';
  container.style.pointerEvents = 'none';

  // Build HTML content (reuse logic from imageGenerator but with some PDF optimizations)
  let html = `
    <div style="text-align: center; margin-bottom: 30px; background-color: white;">
      <h1 style="font-size: 28px; color: #111827; margin: 0;">MIS System - Dashboard FULL Report</h1>
      <p style="font-size: 14px; color: #6b7280; margin-top: 5px;">Generated on: ${today}</p>
      <div style="height: 2px; background-color: #e5e7eb; margin: 20px 0;"></div>
    </div>

    <!-- Summary Sections Table -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 15px 0; margin-bottom: 30px; background-color: white;">
      <tr>
        <!-- Top 5 Best Performers -->
        <td style="width: 33.33%; vertical-align: top; padding: 15px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f0fdf4;">
          <h3 style="font-size: 16px; font-weight: bold; color: #166534; margin: 0 0 15px 0;">
            Top 5 Best Performers
          </h3>
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
            ${(topBestPerformers || []).map(emp => `
              <tr>
                <td style="padding: 8px; background: white; border-radius: 8px; border: 1px solid #dcfce7; font-size: 13px; font-weight: 600; color: #374151;">${emp.name}</td>
                <td style="padding: 8px; background: white; border-radius: 8px; border: 1px solid #dcfce7; font-size: 13px; font-weight: 700; color: #166534; text-align: right;">${emp.donePct || 0}%</td>
              </tr>
            `).join('')}
          </table>
        </td>

        <!-- Pending Tasks by User -->
        <td style="width: 33.33%; vertical-align: top; padding: 15px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fef2f2;">
          <h3 style="font-size: 16px; font-weight: bold; color: #991b1b; margin: 0 0 15px 0;">
            Pending Tasks
          </h3>
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
            ${(pendingTasks || []).map(emp => `
              <tr>
                <td style="padding: 8px; background: white; border-radius: 8px; border: 1px solid #fee2e2; font-size: 13px; font-weight: 600; color: #374151;">${emp.name}</td>
                <td style="padding: 8px; background: white; border-radius: 8px; border: 1px solid #fee2e2; font-size: 13px; font-weight: 700; color: #991b1b; text-align: right;">${emp.pending}</td>
              </tr>
            `).join('')}
          </table>
        </td>

        <!-- Top 5 Worst Performers -->
        <td style="width: 33.33%; vertical-align: top; padding: 15px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fff7ed;">
          <h3 style="font-size: 16px; font-weight: bold; color: #9a3412; margin: 0 0 15px 0;">
            Top 5 Worst Performers
          </h3>
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
            ${(topWorstPerformers || []).map(emp => `
              <tr>
                <td style="padding: 8px; background: white; border-radius: 8px; border: 1px solid #ffedd5; font-size: 13px; font-weight: 600; color: #374151;">${emp.name}</td>
                <td style="padding: 8px; background: white; border-radius: 8px; border: 1px solid #ffedd5; font-size: 13px; font-weight: 700; color: #9a3412; text-align: right;">${emp.workNotDonePercentage ?? emp.score ?? 0}%</td>
              </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Department Performance Section -->
    <div style="margin-bottom: 30px; background-color: white;">
      <h2 style="font-size: 20px; font-weight: bold; color: #374151; margin: 0 0 15px 0;">Department Performance</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Department</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Pending</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Not Done %</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Late %</th>
          </tr>
        </thead>
        <tbody>
          ${(departmentScores || []).map((dept, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">${dept.name}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${dept.pendingWorks}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${(dept.workNotDonePct || 0).toFixed(1)}%</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${(dept.notDoneOnTimePct || 0).toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h2 style="font-size: 20px; color: #374151; font-weight: bold;">Employee Details</h2>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e5e7eb;">
      <thead>
        <tr style="background-color: #2563eb; color: white;">
  `;

  // Add Headers
  visibleColumnsList.forEach(col => {
    html += `<th style="padding: 10px 5px; text-align: left; border: 1px solid #3b82f6;">${col.label}</th>`;
  });

  html += `
        </tr>
      </thead>
      <tbody>
  `;

  // Add Body
  filteredEmployeesData.forEach((emp, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
    html += `<tr style="background-color: ${bgColor};">`;

    visibleColumnsList.forEach(col => {
      let value = '';
      switch (col.key) {
        case 'id': value = emp.id; break;
        case 'name': value = emp.name; break;
        case 'target': value = emp.target; break;
        case 'actualWork': value = emp.actualWorkDone; break;
        case 'weeklyDone': value = emp.weeklyWorkDone; break;
        case 'weeklyOnTime': value = emp.weeklyWorkDoneOnTime; break;
        case 'totalWork': value = emp.totalWorkDone; break;
        case 'weekPending': value = emp.weekPending; break;
        case 'allPending': value = emp.allPendingTillDate; break;
        case 'lastWeekPlannedNotDone': value = emp.plannedWorkNotDone; break;
        case 'lastWeekPlannedNotDoneOnTime': value = emp.plannedWorkNotDoneOnTime; break;
        case 'lastWeekCommitment': value = emp.commitment; break;
        case 'nextWeekPlannedNotDone': value = emp.nextWeekPlannedWorkNotDone || '0'; break;
        case 'nextWeekPlannedNotDoneOnTime': value = emp.nextWeekPlannedWorkNotDoneOnTime || '0'; break;
        case 'nextWeekCommitment': value = emp.nextWeekCommitment || '0'; break;
        default: value = '';
      }
      html += `<td style="padding: 8px 5px; border: 1px solid #e5e7eb; color: #374151;">${value}</td>`;
    });

    html += `</tr>`;
  });

  html += `
      </tbody>
    </table>
    <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 10px;">
      © ${new Date().getFullYear()} MIS System Dashboard. Information exported for internal use.
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 2000));

    const imgData = await toPng(container, {
      quality: 1.0,
      backgroundColor: '#ffffff',
      cacheBust: true,
      pixelRatio: 2 // Higher resolution
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Handle multi-page if content is too long
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`MIS-Dashboard-Report-${today.replace(/\//g, '-')}.pdf`);
  } catch (err) {
    console.error('Error generating PDF:', err);
  } finally {
    document.body.removeChild(container);
  }
};
