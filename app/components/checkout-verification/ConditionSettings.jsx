import SettingsSection from "./SettingsSection";
import CustomRadio from "./CustomRadio";

export default function ConditionSettings() {
  return (
    <>
      <SettingsSection title="Banner status" badge="Basic plan or higher">
        <CustomRadio label="Enabled" checked={false} disabled={true} />
        <CustomRadio label="Disabled" checked={false} disabled={true} />
      </SettingsSection>

      <SettingsSection title="Target" badge="Basic plan or higher">
        <CustomRadio
          label="Always"
          description="Always show the banner without any conditions."
          checked={false}
          disabled={true}
        />
        <CustomRadio
          label="Specific collection"
          description="Show the banner to selected collection."
          checked={false}
          disabled={true}
        />
        <CustomRadio
          label="Specific product"
          description="Show the banner to selected product."
          checked={false}
          disabled={true}
        />
      </SettingsSection>
    </>
  );
}
