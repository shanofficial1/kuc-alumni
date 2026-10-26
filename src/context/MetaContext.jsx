import { createContext, useContext, useEffect, useState } from 'react';
import { metaService } from '../services/metaService';

const MetaContext = createContext(null);
export const useMeta = () => useContext(MetaContext);

/** Loads dropdown options (programs, working statuses, categories) from GET /meta/options. */
export function MetaProvider({ children }) {
  const [state, setState] = useState({ programs: [], workingStatuses: [], categories: [], googleEnabled: false, loading: true, error: null });

  useEffect(() => {
    metaService.options()
      .then((d) => setState({ ...d, loading: false, error: null }))
      .catch((error) => setState((s) => ({ ...s, loading: false, error })));
  }, []);

  return <MetaContext.Provider value={state}>{children}</MetaContext.Provider>;
}
