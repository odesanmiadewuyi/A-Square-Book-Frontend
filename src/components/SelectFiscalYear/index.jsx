import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { request } from '@/request';

export default function SelectFiscalYear({ value, onChange, placeholder = 'Select Fiscal Year', size }) {
  const [options, setOptions] = useState([]);
  const [current, setCurrent] = useState(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await request.get({ entity: 'glperiod/years' });
        const data = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.result)
          ? resp.result
          : [];
        // Ensure unique, sorted numeric years
        const years = [...new Set(data.map((r) => (typeof r === 'number' ? r : r?.fiscalYear)))]
          .filter((y) => typeof y === 'number')
          .sort((a, b) => a - b);
        if (mounted) setOptions(years);
      } catch (_) {
        if (mounted) setOptions([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setCurrent(value);
    }
  }, [value]);

  const handleChange = (val) => {
    setCurrent(val);
    if (typeof onChange === 'function') onChange(val);
  };

  return (
    <Select
      showSearch
      value={current}
      size={size}
      placeholder={placeholder}
      allowClear
      onChange={handleChange}
      filterOption={(input, option) => {
        const lbl = String(option?.children || '');
        return lbl.toLowerCase().includes(String(input || '').toLowerCase());
      }}
    >
      {options.map((y) => (
        <Select.Option key={y} value={y}>
          {y}
        </Select.Option>
      ))}
    </Select>
  );
}

