import React from 'react';
import {
  useVersions,
  useActiveDocContext,
  useDocsVersionCandidates,
  useDocsPreferredVersion,
} from '@docusaurus/plugin-content-docs/client';
import {translate} from '@docusaurus/Translate';
import {useHistorySelector} from '@docusaurus/theme-common';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';

function getVersionMainDoc(version) {
  return version.docs.find((doc) => doc.id === version.mainDocId);
}

function getVersionTargetDoc(version, activeDocContext) {
  return (
    activeDocContext.alternateDocVersions[version.name] ??
    getVersionMainDoc(version)
  );
}

export default function DocsVersionDropdownNavbarItem({
  mobile,
  docsPluginId,
  dropdownActiveClassDisabled,
  dropdownItemsBefore = [],
  dropdownItemsAfter = [],
  ...props
}) {
  const search = useHistorySelector((history) => history.location.search);
  const hash = useHistorySelector((history) => history.location.hash);
  const activeDocContext = useActiveDocContext(docsPluginId);
  const {savePreferredVersionName} = useDocsPreferredVersion(docsPluginId);
  const versions = useVersions(docsPluginId);
  const candidates = useDocsVersionCandidates(docsPluginId);

  const displayedVersion =
    candidates.find((v) => versions.includes(v)) ?? versions[0];

  function versionToLink(version) {
    const hasActiveDoc = activeDocContext?.activeDoc != null;
    // If user is on a page belonging to this plugin, navigate to the target doc;
    // otherwise just go to the homepage.
    const to = hasActiveDoc
      ? `${getVersionTargetDoc(version, activeDocContext).path}${search}${hash}`
      : '/';
    return {
      label: version.label,
      to,
      isActive: () => version === activeDocContext.activeVersion,
      onClick: () => savePreferredVersionName(version.name),
    };
  }

  const items = [
    ...dropdownItemsBefore,
    ...versions.map(versionToLink),
    ...dropdownItemsAfter,
  ];

  const dropdownLabel =
    mobile && items.length > 1
      ? translate({
          id: 'theme.navbar.mobileVersionsDropdown.label',
          message: 'Versions',
        })
      : displayedVersion.label;

  const hasActiveDoc = activeDocContext?.activeDoc != null;
  const dropdownTo =
    mobile && items.length > 1
      ? undefined
      : hasActiveDoc
        ? getVersionTargetDoc(displayedVersion, activeDocContext).path
        : '/';

  if (items.length <= 1) {
    return (
      <DefaultNavbarItem
        {...props}
        mobile={mobile}
        label={dropdownLabel}
        to={dropdownTo}
        isActive={dropdownActiveClassDisabled ? () => false : undefined}
      />
    );
  }

  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      label={dropdownLabel}
      to={dropdownTo}
      items={items}
      isActive={dropdownActiveClassDisabled ? () => false : undefined}
    />
  );
}
