# Aquascaping Databases Research - Comprehensive Inventory

**Date:** August 5, 2025  
**Prepared for:** 3Vantage Aquascaping Project  
**Research Scope:** Public databases and data sources for aquascaping components

## Executive Summary

This document provides a comprehensive inventory of publicly available databases, APIs, and data sources related to aquascaping components including plants, fish, equipment, techniques, maintenance schedules, and academic research. The research covers both technical access methods and licensing considerations for potential integration into aquascaping applications.

---

## 1. Plant Databases

### 1.1 Flowgrow Aquatic Plant Database
- **URL:** https://flowgrow.de/db/aquaticplants
- **Coverage:** 300+ aquatic plant species with comprehensive metadata
- **Key Features:**
  - Searchable by genus (200+ genera), region, plant type, difficulty
  - Growth characteristics, height, width, light requirements
  - Temperature tolerances and aquarium suitability
  - Propagation methods and taxonomic classifications
- **API Access:** No public API documented
- **Data Format:** Web-based database with structured data
- **Licensing:** Community-driven platform, licensing terms not explicitly stated
- **Scraping Potential:** High - structured data with consistent formatting
- **Content Licensing:** Requires permission verification

### 1.2 Tropica Aquarium Plants
- **URL:** https://tropica.com/en/plants/
- **Coverage:** Commercial aquatic plant catalog with care specifications
- **Key Features:**
  - Plant care parameters (pH, hardness, temperature)
  - Difficulty ratings and growth requirements
  - CO2 requirements and lighting specifications
- **API Access:** No public API
- **Scraping Potential:** Medium - commercial site with protection measures
- **Content Licensing:** Commercial content, usage restrictions apply

### 1.3 Aquarium Gardens Plant List
- **URL:** https://www.aquariumgardens.co.uk/aquarium-plants-full-list-64-c.asp
- **Coverage:** A-Z comprehensive plant listing
- **Key Features:** Species names, basic care requirements
- **API Access:** None documented
- **Scraping Potential:** Medium
- **Content Licensing:** Commercial catalog, permission required

---

## 2. Fish Databases

### 2.1 FishBase API (Primary Recommendation)
- **URL:** https://fishbase.ropensci.org/
- **API Documentation:** https://ropensci.github.io/fishbaseapidocs/
- **Coverage:** 35,000+ fish species with 59,200+ references
- **Key Features:**
  - Comprehensive species data including aquarium suitability
  - Water parameter requirements (pH, hardness, temperature)
  - Compatibility information and behavioral data
  - Diet, spawning, and ecological information
- **API Access:** ✅ Full REST API with JSON responses
- **Authentication:** None required (open access)
- **Rate Limits:** Not specified (reasonable use expected)
- **Data Format:** JSON with structured fields
- **Example Endpoints:**
  - `/species` - Species search
  - `/genera` - Genera information  
  - `/ecology` - Ecological data
  - `/diet` - Diet information
- **Licensing:** Open access, academic/research friendly
- **Client Libraries:** R package `rfishbase` available

### 2.2 Fish Compatibility Databases
- **Tankarium:** https://www.tankarium.com/fish-compatibility-chart/
- **Live Aquaria:** https://www.liveaquaria.com/general/general.cfm?general_pagesid=539
- **Planted Tank Mates:** https://plantedtankmates.com/
- **Coverage:** Community compatibility matrices and guidelines
- **API Access:** None documented
- **Scraping Potential:** Medium - structured compatibility data
- **Content Licensing:** Mixed - some commercial, some community

### 2.3 AquaInfo Species Database
- **URL:** https://aquainfo.nl/en/
- **Coverage:** Freshwater and saltwater species with detailed profiles
- **Key Features:**
  - Taxonomic organization with common/scientific names
  - Care requirements and compatibility information
  - Multilingual support
- **API Access:** None documented
- **Scraping Potential:** High - well-structured taxonomic data
- **Content Licensing:** Community resource, terms not explicit

---

## 3. Equipment Databases & Catalogs

### 3.1 Aquarium Equipment Databases
- **Database Base Australia:** Aquarium management software with equipment tracking
- **Features:** Lighting types, filtration systems, substrate categories
- **Coverage:** Equipment compatibility matrices and specifications
- **API Access:** None for public databases
- **Scraping Potential:** Medium - product catalog formats

### 3.2 API Brand Products
- **URL:** https://www.apifishcare.com/products
- **Coverage:** Water testing kits, treatments, equipment
- **Key Features:**
  - Product specifications and compatibility
  - Water parameter testing equipment
  - Treatment and maintenance products
- **API Access:** No public API documented
- **Content Licensing:** Commercial product catalog

### 3.3 Manufacturer Databases
- **Major Brands:** Fluval, Eheim, MarineLand, Seachem
- **Coverage:** Product specifications, compatibility charts
- **API Access:** Generally none available
- **Scraping Potential:** Low to Medium - commercial protection
- **Content Licensing:** Proprietary commercial content

---

## 4. Water Parameter Data

### 4.1 EPA Aquatic Life Criteria
- **URL:** https://www.epa.gov/wqc/national-recommended-water-quality-criteria-aquatic-life-criteria-table
- **Coverage:** Comprehensive water quality standards
- **Key Features:**
  - pH, hardness, temperature criteria by species
  - Toxic chemical concentration limits
  - Environmental protection standards
- **API Access:** Limited government data APIs
- **Data Format:** Structured tables and databases
- **Licensing:** Public domain (US Government)
- **Scraping Potential:** High - public government data

### 4.2 Aquarium Water Parameter Guidelines
- **Sources:** Various hobbyist and commercial sites
- **Coverage:** Species-specific parameter requirements
- **Key Data:**
  - pH ranges (typically 6.5-9.0 for most species)
  - Hardness specifications (GH 4-8, KH 4-7)
  - Temperature ranges (20-30°C optimal)
  - Nitrogen compound limits (Ammonia 0ppm, Nitrite 0ppm, Nitrate <20ppm)
- **API Access:** None standardized
- **Content Licensing:** Mixed sources

---

## 5. Maintenance Schedules & Best Practices

### 5.1 Aquarimate App
- **URL:** https://www.aquarimate.com/
- **Coverage:** Comprehensive aquarium maintenance tracking
- **Key Features:**
  - Parameter logging and graphing
  - Task scheduling and reminders
  - Equipment maintenance tracking
  - Expense management
- **API Access:** None documented for external use
- **Platforms:** iOS, Android, Mac, Windows
- **Pricing:** Free (device storage) / $9.99/year (cloud storage)
- **Data Export:** Limited options

### 5.2 Maintenance Schedule Standards
- **Daily Tasks:** Fish observation, feeding schedules, equipment checks
- **Weekly Tasks:** Water testing, 10-15% water changes, algae cleaning
- **Monthly Tasks:** 25% water changes, filter maintenance, plant pruning
- **Sources:** Multiple aquarium care guides and community resources
- **API Access:** None standardized
- **Content Licensing:** Mostly community knowledge

---

## 6. Aquascaping Styles & Techniques

### 6.1 Style Documentation
- **Iwagumi Style:**
  - Rock-focused layouts with minimal plants
  - Odd-numbered stone arrangements
  - Popular plants: Dwarf hairgrass, Glossostigma, HC Cuba
  - Stone types: Seiryu, Manten, Ohko Dragon stones

- **Nature Aquarium Style:**
  - Terrestrial landscape replicas
  - Mixed hardscape and plants
  - Focus on visual contrasts and complexity
  - Developed by Takashi Amano in 1990s

- **Dutch Aquarium Style:**
  - Plant-focused without hardscape
  - Highly organized, symmetrical layouts
  - Layer-based plant arrangements
  - Originated in Netherlands, 1930s

### 6.2 Style Databases
- **Sources:** Aquascaping Love, Nature Aquariums USA, Buce Plant
- **Coverage:** Style guides, plant recommendations, layout principles
- **API Access:** None available
- **Content Licensing:** Mixed - some commercial, some educational

---

## 7. Public APIs & Programmatic Access

### 7.1 Available APIs

#### FishBase API (Recommended)
- **Base URL:** https://fishbase.ropensci.org/
- **Authentication:** None required
- **Rate Limits:** Reasonable use policy
- **Data Format:** JSON
- **Coverage:** Most comprehensive fish database
- **Status:** Active and maintained

#### Aquarium App API
- **URL:** https://docs.aquarium.app/api/rest/
- **Authentication:** Required (signin token)
- **Data Format:** JSON
- **Status:** Commercial application

### 7.2 Potential API Development Opportunities
- Plant database aggregation API
- Equipment compatibility API
- Maintenance schedule API
- Water parameter tracking API
- Style guide and technique API

---

## 8. Academic Sources & Research

### 8.1 Key Academic Journals
- **Journal of Freshwater Ecology**
  - URL: https://www.tandfonline.com/journals/tjfe20
  - Focus: Freshwater ecosystem research
  - Relevance: Plant and fish ecology

- **Aquatic Conservation: Marine and Freshwater Ecosystems**
  - URL: https://onlinelibrary.wiley.com/journal/10990755
  - Focus: Conservation science
  - Relevance: Species preservation and care

- **Knowledge and Management of Aquatic Ecosystems**
  - URL: https://www.kmae-journal.org/
  - Focus: Ecosystem management
  - Relevance: Aquarium ecosystem principles

- **Aquatic Ecology**
  - URL: https://link.springer.com/journal/10452
  - Focus: Aquatic organism ecology
  - Relevance: Species behavior and requirements

### 8.2 Research Databases
- **Aquatic Sciences and Fisheries Abstracts (ASFA)**
  - Most comprehensive aquatic research database
  - 13 merged databases including FISHLIT, ABAFR
  - Covers biology, ecology, technology, management
  - Access: Academic institutional subscriptions

- **USGS Fisheries Database**
  - URL: https://umesc.usgs.gov/data_library/fisheries/fish1_query.shtml
  - Government research data
  - Public access to raw data
  - Focus: North American species

---

## 9. Government & Official Data Sources

### 9.1 NOAA Fisheries
- **URL:** https://www.fisheries.noaa.gov/
- **Data Downloads:** https://www.fisheries.noaa.gov/recreational-fishing-data/recreational-fishing-data-downloads
- **Coverage:** 474 stocks under 46 fishery management plans
- **API Access:** Limited, custom data requests available
- **Data Format:** SAS and CSV formats
- **Licensing:** Public domain (US Government)

### 9.2 US Fish and Wildlife Service
- **Open Data Portal:** https://gis-fws.opendata.arcgis.com/
- **Coverage:** Conservation and species data
- **API Access:** GIS/mapping APIs available
- **Licensing:** Public domain

### 9.3 FAO Fisheries & Aquaculture
- **URL:** https://www.fao.org/fishery/topic/16054/en
- **Coverage:** Global fisheries data
- **API Access:** Limited
- **Licensing:** International public data

---

## 10. Community-Maintained & Open Source

### 10.1 LibreAquarium
- **URL:** https://sourceforge.net/projects/libreaquarium/
- **Type:** Open source aquarium management software
- **Key Features:**
  - Simulation Model Engine (SME)
  - Pollutant prediction (NO3, PO4, Fe)
  - Central species database
  - Expense and statistics tracking
- **License:** GNU GPL v3.0
- **Platform:** Linux, Mac, Windows
- **Last Update:** 2016 (potentially unmaintained)
- **Database Structure:** Central database of fish, plants, invertebrates

### 10.2 Community Forums & Resources
- **Tropical Fish Keeping:** Community discussions and species databases
- **AquariaCentral:** Software and database discussions
- **Reddit Aquascaping Communities:** r/Aquascape, r/PlantedTank
- **Data Quality:** Variable, community-moderated
- **API Access:** None standardized

---

## 11. Content Licensing & Legal Considerations

### 11.1 Open Access Resources
- **FishBase API:** Open academic access
- **EPA Data:** Public domain (US Government)
- **USGS Data:** Public domain (US Government)
- **Academic Papers:** Varies by publisher

### 11.2 Commercial Content
- **Equipment Catalogs:** Proprietary, permission required
- **Plant Nursery Data:** Commercial, usage restrictions
- **Aquascaping Images:** Copyright protected

### 11.3 Community Content
- **Forum Discussions:** Mixed licensing
- **User-Generated Content:** Platform-specific terms
- **Wiki-Style Resources:** Often Creative Commons

### 11.4 Recommended Approach
1. Prioritize open APIs (FishBase)
2. Use government public domain data
3. Seek permission for commercial content
4. Respect robots.txt for scraping
5. Attribute sources properly
6. Consider fair use limitations

---

## 12. Technical Implementation Recommendations

### 12.1 Priority Data Sources
1. **FishBase API** - Primary fish data source
2. **EPA Water Quality Data** - Parameter standards
3. **Flowgrow Database** - Plant information (with permission)
4. **Community Maintenance Schedules** - Best practices compilation

### 12.2 Data Integration Strategy
- **API-First:** Use available APIs where possible
- **Scheduled Scraping:** For permitted sources with robots.txt compliance
- **Manual Curation:** For specialized aquascaping content
- **Community Contributions:** User-generated additions and corrections

### 12.3 Database Design Considerations
- **Species Tables:** Fish, plants, invertebrates with cross-references
- **Parameter Tables:** Water chemistry requirements by species
- **Compatibility Matrices:** Species interaction data
- **Equipment Catalog:** Searchable product database
- **Maintenance Schedules:** Task templates and customization
- **Style Guides:** Layout principles and plant recommendations

---

## 13. Next Steps & Action Items

### 13.1 Immediate Actions
1. Register for FishBase API access and test integration
2. Contact Flowgrow for data usage permissions
3. Review EPA water quality data for automation opportunities
4. Assess LibreAquarium codebase for database schema insights

### 13.2 Development Priorities
1. Build core species database with FishBase integration
2. Develop plant database from permitted sources
3. Create equipment compatibility matrices
4. Implement maintenance schedule templates
5. Add aquascaping style guides and recommendations

### 13.3 Long-term Opportunities
1. Develop comprehensive aquascaping API
2. Create community contribution platform
3. Integrate with IoT aquarium monitoring systems
4. Build machine learning models for aquascape recommendations
5. Establish partnerships with industry databases

---

## Conclusion

The aquascaping database landscape offers several high-quality data sources, with FishBase API being the standout resource for fish-related data. While comprehensive plant databases exist, they typically lack public APIs, requiring permission-based access or careful scraping approaches. Government sources provide excellent water parameter data under public domain licensing.

The combination of these sources can support a comprehensive aquascaping application, though careful attention to licensing and attribution requirements is essential. The FishBase API should serve as the foundation for fish data, supplemented by curated plant databases and community-maintained resources for equipment and maintenance information.

**Total Estimated Data Coverage:**
- Fish Species: 35,000+ (via FishBase)
- Plant Species: 300+ (via multiple sources)
- Equipment Items: 1,000+ (via manufacturer catalogs)
- Water Parameters: Comprehensive EPA standards
- Maintenance Schedules: Community best practices
- Academic Papers: Thousands via research databases

---

*Document prepared by: 3Vantage Research Team*  
*Contact: research@3vantage.com*  
*Last Updated: August 5, 2025*