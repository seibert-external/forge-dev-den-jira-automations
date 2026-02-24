import React, { useEffect, useState } from 'react';

import { view } from '@forge/bridge';

import ProjectLeadConfig from './ProjectLeadConfig';
import ProjectRolesConfig from './ProjectRolesConfig';

/**
 * Top-level App component that reads the Forge context to determine which
 * automation action module is being configured, then renders the appropriate
 * configuration form.
 *
 * The module key is available on `extension.type` (the manifest action key)
 * provided by the Forge bridge context.
 */
function App() {
  const [moduleKey, setModuleKey] = useState(null);

  useEffect(() => {
    // Retrieve the Forge context so we know which action module loaded this resource.
    view.getContext().then((context) => {
      const key = context?.moduleKey;
      setModuleKey(key);
    });
  }, []);

  // Wait until the context is loaded before rendering anything.
  if (!moduleKey) {
    return null;
  }

  // Route to the correct configuration form based on the module key defined
  // in manifest.yml for each action.
  switch (moduleKey) {
    case 'get-project-lead':
      return <ProjectLeadConfig />;
    case 'get-project-role-members':
      return <ProjectRolesConfig />;
    default:
      return null;
  }
}

export default App;
