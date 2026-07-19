import React, { ReactNode } from "react";
import { BaseTemplate } from "../base.schema";
import { GLOBAL_THEME } from "../theme.config";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentFooter } from "./DocumentFooter";

interface DocumentLayoutProps {
  children: ReactNode;
  data?: Partial<BaseTemplate>;
  title?: string;
  hideFooter?: boolean;
  hideHeader?: boolean;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  pageNumber?: number;
  totalPages?: number;
}

export const DocumentLayout = React.forwardRef<
  HTMLDivElement,
  DocumentLayoutProps
>(
  (
    {
      children,
      data,
      title,
      hideFooter = false,
      hideHeader = false,
      pageSize = "A4",
      orientation = "portrait",
      pageNumber,
      totalPages,
    },
    ref,
  ) => {
    const margins = GLOBAL_THEME.page.margins;

    let docWidth = "21cm";
    let docHeight = "29.7cm";

    if (pageSize === "A4") {
      docWidth = orientation === "landscape" ? "29.7cm" : "21cm";
      docHeight = orientation === "landscape" ? "21cm" : "29.7cm";
    } else if (pageSize === "A3") {
      docWidth = orientation === "landscape" ? "42cm" : "29.7cm";
      docHeight = orientation === "landscape" ? "29.7cm" : "42cm";
    }

    const dynamicPrintStyles = `
      @media print {
        @page {
          size: ${pageSize} ${orientation};
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
      }
    `;

    const isLastPage = pageNumber !== undefined && totalPages !== undefined &&
      pageNumber === totalPages;

    return (
      <div
        ref={ref}
        className="document-container"
        style={{
          width: "100%",
          maxWidth: docWidth,
          height: docHeight,
          minHeight: docHeight,
          margin: "0 auto",
          padding:
            `${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm`,
          fontFamily: GLOBAL_THEME.typography.fontFamily,
          fontSize: GLOBAL_THEME.typography.baseFontSize,
          lineHeight: GLOBAL_THEME.typography.lineHeight,
          color: GLOBAL_THEME.colors.text,
          backgroundColor: "#fff",
          position: "relative",
          pageBreakAfter: isLastPage ? "avoid" : "always",
          pageBreakInside: "avoid",
          boxSizing: "border-box",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: dynamicPrintStyles }} />

        {/* HEADER */}
        {!hideHeader && <DocumentHeader data={data} />}

        {/* BAŞLIK */}
        {title && (
          <div
            style={{
              textAlign: "center",
              fontSize: "14pt",
              fontWeight: "bold",
              marginTop: "30px",
              marginBottom: "20px",
              textDecoration: "underline",
            }}
          >
            {title}
          </div>
        )}

        {/* İÇERİK */}
        <div style={{ marginTop: "20px" }} className="document-content">
          {children}
        </div>

        {/* FOOTER */}
        {!hideFooter && !data?.kurumIci && <DocumentFooter data={data} />}

        {/* DİNAMİK SAYFA NUMARASI */}
        {pageNumber !== undefined && totalPages !== undefined && (
          <div
            style={{
              position: "absolute",
              bottom: "1cm",
              left: "0",
              right: "0",
              textAlign: "center",
              fontSize: "10pt",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            {pageNumber} / {totalPages}
          </div>
        )}
      </div>
    );
  },
);

DocumentLayout.displayName = "DocumentLayout";
