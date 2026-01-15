<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
          th { background-color: #f4f4f4; }
          div { margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>

        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Hreflang</th>
          </tr>

          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td>
                <xsl:value-of select="sitemap:loc"/>
              </td>

              <td>
                <xsl:value-of select="sitemap:lastmod"/>
              </td>

              <td>
                <xsl:for-each select="xhtml:link">
                  <div>
                    <strong><xsl:value-of select="@hreflang"/></strong> :
                    <xsl:value-of select="@href"/>
                  </div>
                </xsl:for-each>
              </td>
            </tr>
          </xsl:for-each>

        </table>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
