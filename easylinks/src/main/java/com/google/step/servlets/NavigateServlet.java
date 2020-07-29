package com.google.step.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Scanner;
import java.util.LinkedHashMap;

/** Servlet responsible for the navigating to the building in Columbia Univserity */
@WebServlet("/~where/*")
public class NavigateServlet extends HttpServlet {
  
  @Override
  /** Reads the building abbrevation and the building name from the local file */
  public void init() {
    Scanner scanner = new Scanner(getServletContext().getResourceAsStream(
        "/WEB-INF/columbiaU_buildings.csv"));
    
    while (scanner.hasNextLine()) {
      String[] cells = scanner.nextLine().split(",");
      // cells[0] stores the building abbrevation, cells[1] stores the name
      buildingMap.put(cells[0], cells[1]);
    }
    scanner.close();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String[] requestUrls = request.getRequestURI().split("/");
    if (requestUrls.length < URL_MIN_LENGTH) {
      response.getWriter().println("Invalid input");
      return;
    }
    String buildingCode = requestUrls[2].toUpperCase();
    response.sendRedirect(NAVIGATION_PAGE + buildingMap.get(buildingCode));
  }



  private final LinkedHashMap<String, String> buildingMap = new LinkedHashMap<>();

  private static final int URL_MIN_LENGTH = 3;
  private static final String NAVIGATION_PAGE = "/navigation.html?dest=";

}