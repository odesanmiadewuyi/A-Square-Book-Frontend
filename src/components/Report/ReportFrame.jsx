import { REPORT_BASE_URL } from '@/config/serverApiConfig';

export const buildReportUrl = (path, params = {}) => {
  const query = new URLSearchParams({
    'rs:embed': 'true',
    ...params,
  }).toString();
  const base = (REPORT_BASE_URL || '/ssrs/').replace(/\/+$/, '');
  return `${base}/Pages/Report.aspx?ItemPath=${encodeURIComponent(path)}&${query}`;
};

export default function ReportFrame({ path, params = {}, height = '80vh', onLoad }) {
  const src = buildReportUrl(path, params);

  return (
    <iframe
      title="Report"
      src={src}
      onLoad={onLoad}
      style={{
        width: '100%',
        height,
        border: 'none',
        background: '#fff',
      }}
      allow="fullscreen"
    />
  );
}
