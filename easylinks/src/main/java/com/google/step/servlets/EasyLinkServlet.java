package com.google.step.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responses to redirect the easy link to another website*/
@WebServlet("/easy-link")
public class EasyLinkServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String[] easyLink = ServletHelper.getParameterWithDefault(request, "easy-link", "").split("/");

    switch (easyLink[0])
    {
      case EMPTY_LINK:
        response.sendRedirect(HOME_PAGE);
        break;
      case PROVIDED_LINK:
        break;
      case NAVIGATION_LINK:
        break;
      case PEOPLE_SEARCH_LINK:
        break;
      default:
        // Customized links
        break;
    }
  }

  /** Private constants for different types of link */
  private static final String PROVIDED_LINK = "~";
  private static final String EMPTY_LINK = "";
  private static final String NAVIGATION_LINK = "~where";
  private static final String PEOPLE_SEARCH_LINK = "~who";
  private static final String HOME_PAGE = "/index.html";
}