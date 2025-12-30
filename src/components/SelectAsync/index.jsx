import { useState, useEffect } from 'react';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { Select, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { generate as uniqueId } from 'shortid';
import color from '@/utils/color';
import useLanguage from '@/locale/useLanguage';

const SelectAsync = ({
  entity,
  displayLabels = ['name'],
  outputValue = '_id',
  redirectLabel = '',
  withRedirect = false,
  urlToRedirect = '/',
  placeholder = 'select',
  value,
  onChange,
  onSelectRecord,
  listOptions = {},
  remoteSearch = false,
  size,
}) => {
  const translate = useLanguage();
  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);

  const navigate = useNavigate();

  const asyncList = (opts = {}) => {
    return request.list({ entity, options: { ...listOptions, ...opts } });
  };
  const { result, isLoading: fetchIsLoading, isSuccess } = useFetch(() => asyncList());
  useEffect(() => {
    if (isSuccess) {
      const arr = Array.isArray(result)
        ? result
        : Array.isArray(result?.result)
        ? result.result
        : Array.isArray(result?.data)
        ? result.data
        : [];
      setOptions(arr);

      // If current selected value is no longer present in the new options
      // (e.g., a reference got consumed and filtered out), clear it so the
      // input does not continue to display a stale selection.
      try {
        const toValue = (opt) => (opt?.[outputValue] ?? opt);
        const exists = (val) => (arr || []).some((o) => String(toValue(o)) === String(val));
        if (currentValue !== undefined && !exists(currentValue)) {
          setCurrentValue(undefined);
          if (typeof onChange === 'function') onChange(undefined);
        }
      } catch (_) {
        // non-blocking safeguard; ignore any clearing error
      }
    }
  }, [isSuccess, result]);

  const labels = (optionField) => {
    return displayLabels.map((x) => optionField[x]).join(' ');
  };
  useEffect(() => {
    if (value !== undefined) {
      const val = value?.[outputValue] ?? value;
      setCurrentValue(val);
      onChange(val);
    }
  }, [value]);

  const handleSelectChange = (newValue, option) => {
    if (newValue === 'redirectURL') {
      navigate(urlToRedirect);
      return;
    }
    const val = newValue?.[outputValue] ?? newValue;
    setCurrentValue(newValue);
    // Pass only value; callers should look up full record by id if needed
    if (typeof onChange === 'function') onChange(val);
    // Optionally return the full selected record for detail previews
    if (typeof onSelectRecord === 'function') {
      const rec = option?.record || option?.props?.record;
      if (rec) onSelectRecord(rec);
    }
  };

  const handleSearch = async (input) => {
    if (!remoteSearch) return; // rely on local filter
    try {
      const resp = await asyncList({ search: input });
      const arr = Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.result)
        ? resp.result
        : Array.isArray(resp?.data)
        ? resp.data
        : [];
      setOptions(arr);
    } catch (e) {
      // ignore
    }
  };

  const optionsList = () => {
    const list = [];

    // if (selectOptions.length === 0 && withRedirect) {
    //   const value = 'redirectURL';
    //   const label = `+ ${translate(redirectLabel)}`;
    //   list.push({ value, label });
    // }
    (Array.isArray(selectOptions) ? selectOptions : []).map((optionField) => {
      const value = optionField[outputValue] ?? optionField;
      const label = labels(optionField);
      const currentColor = optionField[outputValue]?.color ?? optionField?.color;
      const labelColor = color.find((x) => x.color === currentColor);
      list.push({ value, label, color: labelColor?.color, record: optionField });
    });

    return list;
  };

  return (
    <Select
      showSearch
      allowClear
      onSearch={handleSearch}
      loading={fetchIsLoading}
      disabled={fetchIsLoading}
      value={currentValue}
      onChange={handleSelectChange}
      placeholder={placeholder}
      size={size}
      filterOption={(input, option) => {
        const label = (option?.props && (option.props['data-label'] || option.props.children?.props?.children)) || '';
        return (label || '').toString().toLowerCase().includes((input || '').toLowerCase());
      }}
      optionFilterProp={'data-label'}
    >
      {optionsList()?.map((option) => {
        return (
          <Select.Option key={`${uniqueId()}`} value={option.value} data-label={option.label} record={option.record}>
            <Tag bordered={false} color={option.color}>
              {option.label}
            </Tag>
          </Select.Option>
        );
      })}
      {withRedirect && (
        <Select.Option value={'redirectURL'}>{`+ ` + translate(redirectLabel)}</Select.Option>
      )}
    </Select>
  );
};

export default SelectAsync;
