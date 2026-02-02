<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 2rem;
            line-height: 1.6;
          }
          h1 { color: #222; }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 1.5rem;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
            vertical-align: middle;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          td.url {
            word-break: break-all;
            max-width: 400px;
          }
          img {
            max-width: 140px;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          }
          .no-image {
            color: #888;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <h1> Sitemap Preview</h1>
        <p>Showing pages + associated</p>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Page URL</th>
              <!-- <th>Image</th> -->
              <th>Last Modified</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
              <td>
      <xsl:value-of select="position()"/>
    </td>
                <td class="url">
                  <a href="{sitemap:loc}" target="_blank">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td>
                  <xsl:value-of select="sitemap:lastmod"/>
                  <xsl:if test="not(sitemap:lastmod)">—</xsl:if>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>

        <p style="margin-top:2rem; color:#666; font-size:0.9rem;">
          Generated from  sitemap using XSLT • 
          Images come from <code>&lt;image:loc&gt;</code> tag
        </p>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>