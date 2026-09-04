import vacationFile from "@/data/vacation.json";
import { useTranslations } from "@/i18n/context";
import { useStudioPreview } from "@/lib/studio-preview";

export interface VacationSettings {
  enabled: boolean;
  pausePhysical: boolean;
}

export function getVacationSettings(): VacationSettings {
  return {
    enabled: Boolean(vacationFile.enabled),
    pausePhysical: Boolean(vacationFile.pausePhysical),
  };
}

export function isPhysicalCheckoutPaused(settings = getVacationSettings()): boolean {
  return settings.enabled && settings.pausePhysical;
}

export function useVacation() {
  const t = useTranslations("vacation");
  const studio = useStudioPreview();
  const settings = studio?.vacation ?? getVacationSettings();
  const until = t("until").trim();

  return {
    enabled: settings.enabled,
    pausePhysical: isPhysicalCheckoutPaused(settings),
    title: t("title"),
    message: t("message"),
    until,
  };
}
